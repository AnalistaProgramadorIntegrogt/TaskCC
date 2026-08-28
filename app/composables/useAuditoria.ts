// composables/useAuditoria.ts
import { ref } from 'vue'

export interface TareaAuditada {
  id: number
  checklist_id: number
  proyecto_id?: number
  proyecto_nombre?: string
  proyecto_checklist_id?: number
  fecha: string
  dia?: string
  tarea_id?: number
  tarea_nombre: string
  tarea_descripcion?: string
  grupo_id?: number
  grupo_nombre?: string
  completada: boolean
  completada_at: string | null
  colaborador_asignado_id: number
  colaborador_asignado_nombre: string
  colaborador_resuelve_id: number | null
  colaborador_resuelve_nombre: string | null
  foto_url: string | null
  foto_path: string | null
  observaciones: string | null
  qr_escaneado?: boolean
  qr_escaneado_at?: string | null
  auditada: boolean
  auditoria_puntaje: number | null
  auditoria_comentario: string | null
  auditado_por_id: number | null
  auditor_nombre: string | null
  auditado_at: string | null
}

export interface FiltrosAuditoria {
  fechaInicio?: string | null
  fechaFin?: string | null
  proyectoId?: string | number | null
  colaboradorId?: string | number | null
  estadoRevision?: 'todas' | 'pendientes' | 'revisadas'
  busqueda?: string
}

export function useAuditoria() {
  const supabase = useSupabaseClient()
  const cargando = ref(false)
  const guardando = ref(false)
  const error = ref<string | null>(null)

  /**
   * Carga todas las tareas completadas y su información de auditoría
   */
  async function cargarTareasParaAuditoria(filtros: FiltrosAuditoria = {}): Promise<TareaAuditada[]> {
    cargando.value = true
    error.value = null
    try {
      // 1. Obtener checklists dentro del rango de fechas si se especifica
      let queryChecklists = supabase
        .from('checklists')
        .select(`
          id,
          fecha,
          dia,
          proyecto_id,
          proyecto_checklist_id,
          colaborador_asignado_id,
          proyecto:proyectos ( id, nombre ),
          colaborador_asignado:colaboradores ( id, nombre )
        `)

      if (filtros.fechaInicio) {
        queryChecklists = queryChecklists.gte('fecha', filtros.fechaInicio)
      }
      if (filtros.fechaFin) {
        queryChecklists = queryChecklists.lte('fecha', filtros.fechaFin)
      }
      if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
        queryChecklists = queryChecklists.eq('proyecto_id', Number(filtros.proyectoId))
      }
      if (filtros.colaboradorId && filtros.colaboradorId !== 'todos') {
        queryChecklists = queryChecklists.eq('colaborador_asignado_id', Number(filtros.colaboradorId))
      }

      const { data: checklistsData, error: errChecklists } = await queryChecklists
      if (errChecklists) throw errChecklists

      const checklistsMap = new Map<number, any>()
      const checklistIds: number[] = []

      ;(checklistsData || []).forEach(c => {
        checklistsMap.set(c.id, c)
        checklistIds.push(c.id)
      })

      if (checklistIds.length === 0) {
        return []
      }

      // 2. Obtener tareas completadas para los checklists encontrados
      let queryTareas = supabase
        .from('checklist_tareas')
        .select(`
          id,
          checklist_id,
          proyecto_checklist_id,
          tarea_id,
          grupo_id,
          tarea_nombre_snapshot,
          grupo_nombre_snapshot,
          completada,
          completada_at,
          colaborador_responsable_id,
          colaborador_resuelve_id,
          foto_url,
          foto_path,
          observaciones,
          qr_escaneado,
          qr_escaneado_at,
          auditada,
          auditoria_puntaje,
          auditoria_comentario,
          auditado_por_id,
          auditado_at,
          tarea:tareas ( id, nombre, descripcion ),
          grupo:grupos ( id, nombre ),
          colaborador_responsable:colaboradores!colaborador_responsable_id ( id, nombre ),
          colaborador_resuelve:colaboradores!colaborador_resuelve_id ( id, nombre ),
          auditor:colaboradores!auditado_por_id ( id, nombre )
        `)
        .eq('completada', true)
        .in('checklist_id', checklistIds)
        .order('completada_at', { ascending: false, nullsFirst: false })

      // Filtro de estado de revisión en base de datos si aplica
      if (filtros.estadoRevision === 'pendientes') {
        queryTareas = queryTareas.or('auditada.is.null,auditada.eq.false')
      } else if (filtros.estadoRevision === 'revisadas') {
        queryTareas = queryTareas.eq('auditada', true)
      }

      const { data: tareasData, error: errTareas } = await queryTareas
      if (errTareas) {
        // En caso de que las relaciones FK fallen por nombres específicos, reintentar consulta simplificada
        console.warn('Consulta con joins automáticos falló, reintentando consulta base:', errTareas.message)
        return await cargarTareasCompletadasFallback(checklistIds, checklistsMap, filtros)
      }

      // 3. Mapear datos a la interfaz estandarizada
      let lista: TareaAuditada[] = (tareasData || []).map(t => {
        const chk = checklistsMap.get(t.checklist_id) || {}
        const nombreTarea = t.tarea_nombre_snapshot || t.tarea?.nombre || 'Tarea sin nombre'
        const nombreGrupo = t.grupo_nombre_snapshot || t.grupo?.nombre || 'Tarea individual'
        const nombreColabAsignado = t.colaborador_responsable?.nombre || chk.colaborador_asignado?.nombre || 'Sin asignar'
        const nombreColabResuelve = t.colaborador_resuelve?.nombre || nombreColabAsignado
        const nombreAuditor = t.auditor?.nombre || null

        return {
          id: t.id,
          checklist_id: t.checklist_id,
          proyecto_id: chk.proyecto_id,
          proyecto_nombre: chk.proyecto?.nombre || 'Proyecto General',
          proyecto_checklist_id: t.proyecto_checklist_id || chk.proyecto_checklist_id,
          fecha: chk.fecha,
          dia: chk.dia,
          tarea_id: t.tarea_id,
          tarea_nombre: nombreTarea,
          tarea_descripcion: t.tarea?.descripcion || '',
          grupo_id: t.grupo_id,
          grupo_nombre: nombreGrupo,
          completada: t.completada,
          completada_at: t.completada_at,
          colaborador_asignado_id: t.colaborador_responsable_id || chk.colaborador_asignado_id,
          colaborador_asignado_nombre: nombreColabAsignado,
          colaborador_resuelve_id: t.colaborador_resuelve_id,
          colaborador_resuelve_nombre: nombreColabResuelve,
          foto_url: t.foto_url,
          foto_path: t.foto_path,
          observaciones: t.observaciones,
          qr_escaneado: Boolean(t.qr_escaneado),
          qr_escaneado_at: t.qr_escaneado_at,
          auditada: Boolean(t.auditada),
          auditoria_puntaje: t.auditoria_puntaje,
          auditoria_comentario: t.auditoria_comentario,
          auditado_por_id: t.auditado_por_id,
          auditor_nombre: nombreAuditor,
          auditado_at: t.auditado_at
        }
      })

      // Si se filtró por colaborador
      if (filtros.colaboradorId && filtros.colaboradorId !== 'todos') {
        const cId = Number(filtros.colaboradorId)
        lista = lista.filter(item => item.colaborador_asignado_id === cId || item.colaborador_resuelve_id === cId)
      }

      // Filtro de búsqueda por texto en memoria si se especifica
      if (filtros.busqueda && filtros.busqueda.trim() !== '') {
        const q = filtros.busqueda.toLowerCase().trim()
        return lista.filter(item => 
          item.tarea_nombre.toLowerCase().includes(q) ||
          item.grupo_nombre?.toLowerCase().includes(q) ||
          item.proyecto_nombre?.toLowerCase().includes(q) ||
          item.colaborador_asignado_nombre.toLowerCase().includes(q) ||
          item.colaborador_resuelve_nombre?.toLowerCase().includes(q) ||
          item.observaciones?.toLowerCase().includes(q) ||
          item.auditoria_comentario?.toLowerCase().includes(q)
        )
      }

      return lista
    } catch (e: any) {
      console.error('Error al cargar tareas para auditoría:', e)
      error.value = e.message || 'Error al cargar tareas para auditoría'
      return []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Consulta fallback por si las relaciones FK de auditoría aún no están cacheadas
   */
  async function cargarTareasCompletadasFallback(
    checklistIds: number[], 
    checklistsMap: Map<number, any>, 
    filtros: FiltrosAuditoria
  ): Promise<TareaAuditada[]> {
    const { data: tareasData, error: err } = await supabase
      .from('checklist_tareas')
      .select('*')
      .eq('completada', true)
      .in('checklist_id', checklistIds)
      .order('completada_at', { ascending: false })

    if (err) throw err

    // Cargar nombres de colaboradores para auditor y resuelve
    const { data: colaboradores } = await supabase.from('colaboradores').select('id, nombre')
    const colabMap = new Map((colaboradores || []).map(c => [c.id, c.nombre]))

    const resultado: TareaAuditada[] = (tareasData || []).map(t => {
      const chk = checklistsMap.get(t.checklist_id) || {}
      const nombreColabAsignado = chk.colaborador_asignado?.nombre || colabMap.get(chk.colaborador_asignado_id) || 'Desconocido'
      const nombreColabResuelve = colabMap.get(t.colaborador_resuelve_id) || nombreColabAsignado
      const nombreAuditor = colabMap.get(t.auditado_por_id) || null

      return {
        id: t.id,
        checklist_id: t.checklist_id,
        proyecto_id: chk.proyecto_id,
        proyecto_nombre: chk.proyecto?.nombre || 'General',
        proyecto_checklist_id: t.proyecto_checklist_id || chk.proyecto_checklist_id,
        fecha: chk.fecha,
        dia: chk.dia,
        tarea_id: t.tarea_id,
        tarea_nombre: t.tarea_nombre_snapshot || 'Tarea',
        tarea_descripcion: '',
        grupo_id: t.grupo_id,
        grupo_nombre: t.grupo_nombre_snapshot || 'Individual',
        completada: t.completada,
        completada_at: t.completada_at,
        colaborador_asignado_id: chk.colaborador_asignado_id,
        colaborador_asignado_nombre: nombreColabAsignado,
        colaborador_resuelve_id: t.colaborador_resuelve_id,
        colaborador_resuelve_nombre: nombreColabResuelve,
        foto_url: t.foto_url,
        foto_path: t.foto_path,
        observaciones: t.observaciones,
        auditada: Boolean(t.auditada),
        auditoria_puntaje: t.auditoria_puntaje,
        auditoria_comentario: t.auditoria_comentario,
        auditado_por_id: t.auditado_por_id,
        auditor_nombre: nombreAuditor,
        auditado_at: t.auditado_at
      }
    })

    return resultado
  }

  /**
   * Guarda o actualiza la calificación (1-10) y comentario de auditoría
   */
  async function guardarAuditoria(
    tareaId: number, 
    { puntaje, comentario, auditorId }: { puntaje: number; comentario: string; auditorId: number }
  ) {
    guardando.value = true
    error.value = null
    try {
      if (puntaje < 1 || puntaje > 10) {
        throw new Error('La calificación debe ser un valor entero entre 1 y 10.')
      }

      const payload = {
        auditada: true,
        auditoria_puntaje: Math.round(puntaje),
        auditoria_comentario: (comentario || '').trim(),
        auditado_por_id: auditorId,
        auditado_at: new Date().toISOString()
      }

      const { data, error: errUpdate } = await supabase
        .from('checklist_tareas')
        .update(payload)
        .eq('id', tareaId)
        .select()
        .single()

      if (errUpdate) throw errUpdate
      return data
    } catch (e: any) {
      console.error('Error al guardar auditoría de tarea:', e)
      error.value = e.message || 'Error al guardar la calificación'
      throw e
    } finally {
      guardando.value = false
    }
  }

  /**
   * Elimina/restablece la auditoría de una tarea a pendiente
   */
  async function eliminarAuditoria(tareaId: number) {
    guardando.value = true
    try {
      const payload = {
        auditada: false,
        auditoria_puntaje: null,
        auditoria_comentario: null,
        auditado_por_id: null,
        auditado_at: null
      }

      const { data, error: errUpdate } = await supabase
        .from('checklist_tareas')
        .update(payload)
        .eq('id', tareaId)
        .select()
        .single()

      if (errUpdate) throw errUpdate
      return data
    } catch (e: any) {
      console.error('Error al reiniciar auditoría:', e)
      throw e
    } finally {
      guardando.value = false
    }
  }

  /**
   * Helpers para colores y etiquetas de puntajes 1 a 10
   */
  function getScoreBadgeClass(score: number | null): string {
    if (score === null || score === undefined) return 'badge-ghost text-base-content/60'
    if (score >= 9) return 'bg-emerald-500 text-white border-emerald-600 font-black'
    if (score >= 7) return 'bg-blue-500 text-white border-blue-600 font-black'
    if (score >= 5) return 'bg-amber-500 text-white border-amber-600 font-black'
    return 'bg-rose-500 text-white border-rose-600 font-black'
  }

  function getScoreText(score: number | null): string {
    if (score === null || score === undefined) return 'Sin calificar'
    if (score >= 9) return 'Excelente'
    if (score >= 7) return 'Bueno / Adecuado'
    if (score >= 5) return 'Aceptable / Regular'
    return 'Deficiente / Requiere mejora'
  }

  function getScoreColor(score: number | null): string {
    if (score === null || score === undefined) return '#9ca3af'
    if (score >= 9) return '#10b981'
    if (score >= 7) return '#3b82f6'
    if (score >= 5) return '#f59e0b'
    return '#ef4444'
  }

  return {
    cargando,
    guardando,
    error,
    cargarTareasParaAuditoria,
    guardarAuditoria,
    eliminarAuditoria,
    getScoreBadgeClass,
    getScoreText,
    getScoreColor
  }
}
