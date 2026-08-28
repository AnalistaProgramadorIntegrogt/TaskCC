import { ref, computed } from 'vue'
import { getColaboradorColor } from '~/utils/colors'

export interface FiltrosReporte {
  proyectoId: number | string
  proyectoChecklistId: number | string
  colaboradorId: number | string
  fechaInicio: string
  fechaFin: string
  estado?: 'todos' | 'completadas' | 'pendientes'
  busqueda?: string
}

export interface TareaReporteItem {
  id: number
  checklistId: number
  fecha: string
  dia: string
  proyectoId: number
  proyectoNombre: string
  proyectoChecklistId: number | null
  checklistNombre: string
  checklistColor: string
  colaboradorAsignadoId: number
  colaboradorAsignadoNombre: string
  colaboradorColor: string
  colaboradorResuelveId: number | null
  colaboradorResuelveNombre: string | null
  tareaId: number
  tareaNombre: string
  tareaDescripcion: string | null
  grupoId: number | null
  grupoNombre: string | null
  completada: boolean
  completadaAt: string | null
  observaciones: string | null
  fotoUrl: string | null
  fotoPath: string | null
  estadoTexto: 'Completada' | 'Pendiente' | 'No realizada'
}

export interface IncidenciaReporteItem {
  id: number
  colaboradorId: number
  colaboradorNombre: string
  colaboradorColor: string
  proyectoId: number | null
  proyectoNombre: string | null
  titulo: string
  descripcion: string | null
  fotoUrl: string | null
  fotoPath: string | null
  fecha: string
  hora: string
  fechaHora: string
  estado: string
  estadoTexto: 'Listo' | 'Pendiente'
}

export interface ColaboradorResumenReporte {
  colaboradorId: number
  nombre: string
  rol: string
  color: string
  totalAsignadas: number
  completadas: number
  pendientes: number
  porcentaje: number
  totalFotos: number
  porcentajeFotos: number
  totalFallas: number
  totalMontajes: number
}

export interface ChecklistResumenReporte {
  id: number | string
  nombre: string
  color: string
  total: number
  completadas: number
  pendientes: number
  porcentaje: number
}

export function useReportes() {
  const supabase = useSupabaseClient()

  const cargando = ref(false)
  const tareas = ref<TareaReporteItem[]>([])
  const incidencias = ref<IncidenciaReporteItem[]>([])
  const montajes = ref<any[]>([])
  const colaboradoresCatalogo = ref<any[]>([])
  const proyectosCatalogo = ref<any[]>([])
  const checklistsCatalogo = ref<any[]>([])

  async function cargarCatalogosBase() {
    try {
      const [resColabs, resRoles, resProys, resChks] = await Promise.all([
        supabase.from('colaboradores').select('id, nombre, email, telefono, rol_id, aprobado').order('nombre', { ascending: true }),
        supabase.from('roles').select('id, rol'),
        supabase.from('proyectos').select('id, nombre, activo').order('nombre', { ascending: true }),
        supabase.from('proyecto_checklists').select('id, proyecto_id, nombre, color')
      ])

      const rolesMap = new Map<number, string>()
      ;(resRoles.data || []).forEach((r: any) => rolesMap.set(Number(r.id), r.rol))

      colaboradoresCatalogo.value = (resColabs.data || []).map((c: any) => ({
        ...c,
        id: Number(c.id),
        rol: rolesMap.get(Number(c.rol_id)) || 'Colaborador'
      }))

      proyectosCatalogo.value = resProys.data || []
      checklistsCatalogo.value = resChks.data || []
    } catch (err) {
      console.error('Error cargando catálogos base:', err)
    }
  }

  async function cargarDatosReporte(filtros: FiltrosReporte) {
    cargando.value = true
    try {
      // 1. Asegurar que los catálogos estén disponibles
      await cargarCatalogosBase()

      // Mapas en memoria para lookup O(1)
      const mapaColabs = new Map<number, any>()
      colaboradoresCatalogo.value.forEach((c: any) => mapaColabs.set(Number(c.id), c))

      const mapaProys = new Map<number, string>()
      proyectosCatalogo.value.forEach((p: any) => mapaProys.set(Number(p.id), p.nombre))

      const mapaProyectoChecklists = new Map<number, { nombre: string; color: string }>()
      checklistsCatalogo.value.forEach((chk: any) => {
        mapaProyectoChecklists.set(Number(chk.id), {
          nombre: chk.nombre,
          color: chk.color || '#3b82f6'
        })
      })

      // 2. Consulta de Checklists directa
      let queryChecklists = supabase
        .from('checklists')
        .select('id, fecha, dia, proyecto_id, proyecto_checklist_id, colaborador_asignado_id')

      if (filtros.fechaInicio) {
        queryChecklists = queryChecklists.gte('fecha', filtros.fechaInicio)
      }
      if (filtros.fechaFin) {
        queryChecklists = queryChecklists.lte('fecha', filtros.fechaFin)
      }
      if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
        queryChecklists = queryChecklists.eq('proyecto_id', Number(filtros.proyectoId))
      }
      if (filtros.proyectoChecklistId && filtros.proyectoChecklistId !== 'todos') {
        queryChecklists = queryChecklists.eq('proyecto_checklist_id', Number(filtros.proyectoChecklistId))
      }
      if (filtros.colaboradorId && filtros.colaboradorId !== 'todos') {
        queryChecklists = queryChecklists.eq('colaborador_asignado_id', Number(filtros.colaboradorId))
      }

      // 3. Consulta de Incidencias reales directa de forma segura
      let incidenciasData: any[] = []
      try {
        let queryIncidencias = supabase
          .from('incidencias')
          .select('id, colaborador_id, proyecto_id, checklist_tarea_id, titulo, descripcion, foto_url, foto_path, fecha, hora, fecha_hora, estado, created_at')
          .order('fecha_hora', { ascending: false })

        if (filtros.fechaInicio) {
          queryIncidencias = queryIncidencias.gte('fecha', filtros.fechaInicio)
        }
        if (filtros.fechaFin) {
          queryIncidencias = queryIncidencias.lte('fecha', filtros.fechaFin)
        }
        if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
          queryIncidencias = queryIncidencias.eq('proyecto_id', Number(filtros.proyectoId))
        }
        if (filtros.colaboradorId && filtros.colaboradorId !== 'todos') {
          queryIncidencias = queryIncidencias.eq('colaborador_id', Number(filtros.colaboradorId))
        }

        const resInc = await queryIncidencias
        if (resInc && resInc.data) {
          incidenciasData = resInc.data
        }
      } catch (err) {
        console.warn('Tabla incidencias no disponible o vacía:', err)
        incidenciasData = []
      }

      // 3.1 Consulta de Montajes reales
      let montajesData: any[] = []
      try {
        let queryMontajes = supabase
          .from('montajes')
          .select('id, proyecto_id, colaborador_id, titulo, descripcion, fecha, hora, fecha_hora, estado, foto_url')
          .order('fecha_hora', { ascending: false })

        if (filtros.fechaInicio) {
          queryMontajes = queryMontajes.gte('fecha', filtros.fechaInicio)
        }
        if (filtros.fechaFin) {
          queryMontajes = queryMontajes.lte('fecha', filtros.fechaFin)
        }
        if (filtros.proyectoId && filtros.proyectoId !== 'todos') {
          queryMontajes = queryMontajes.eq('proyecto_id', Number(filtros.proyectoId))
        }
        if (filtros.colaboradorId && filtros.colaboradorId !== 'todos') {
          queryMontajes = queryMontajes.eq('colaborador_id', Number(filtros.colaboradorId))
        }

        const resMont = await queryMontajes
        if (resMont && resMont.data) {
          montajesData = resMont.data
        }
      } catch (err) {
        console.warn('Tabla montajes no disponible o vacía:', err)
        montajesData = []
      }

      montajes.value = montajesData

      // Consulta de checklists y catálogo de tareas
      const [resChecklists, resTareasCat] = await Promise.all([
        queryChecklists,
        supabase.from('tareas').select('id, nombre, descripcion')
      ])

      if (resChecklists.error) throw resChecklists.error

      const checklistsData = resChecklists.data || []
      const tareasCatMap = new Map<number, any>()
      ;(resTareasCat.data || []).forEach((t: any) => tareasCatMap.set(Number(t.id), t))

      // Mapear Incidencias Reales
      incidencias.value = (incidenciasData || []).map((inc: any) => {
        const cId = Number(inc.colaborador_id || 0)
        const colabObj = mapaColabs.get(cId) || {}
        const proyNombre = mapaProys.get(Number(inc.proyecto_id)) || null
        const estadoLower = (inc.estado || '').toLowerCase()
        const estadoTexto: 'Listo' | 'Pendiente' = (estadoLower === 'resuelta' || estadoLower === 'completada' || estadoLower === 'listo') ? 'Listo' : 'Pendiente'

        return {
          id: Number(inc.id),
          colaboradorId: cId,
          colaboradorNombre: colabObj.nombre || (cId ? `Colaborador #${cId}` : 'Sin Asignar'),
          colaboradorColor: getColaboradorColor(cId),
          proyectoId: inc.proyecto_id ? Number(inc.proyecto_id) : null,
          proyectoNombre: proyNombre,
          titulo: inc.titulo || 'Incidencia',
          descripcion: inc.descripcion || null,
          fotoUrl: inc.foto_url || null,
          fotoPath: inc.foto_path || null,
          fecha: inc.fecha || '',
          hora: inc.hora || '',
          fechaHora: inc.fecha_hora || '',
          estado: inc.estado || 'abierta',
          estadoTexto
        }
      })

      if (checklistsData.length === 0) {
        tareas.value = []
        return []
      }

      const checklistIds = checklistsData.map((c: any) => Number(c.id))

      // 4. Traer tareas asignadas de esos checklists en lotes seguros
      const batchSize = 200
      let todasTareasData: any[] = []
      for (let i = 0; i < checklistIds.length; i += batchSize) {
        const chunk = checklistIds.slice(i, i + batchSize)
        const { data: chunkTareas, error: errChunk } = await supabase
          .from('checklist_tareas')
          .select(`
            id,
            checklist_id,
            proyecto_checklist_id,
            tarea_id,
            grupo_id,
            completada,
            completada_at,
            observaciones,
            foto_url,
            foto_path,
            colaborador_responsable_id,
            colaborador_resuelve_id,
            tarea_nombre_snapshot,
            grupo_nombre_snapshot
          `)
          .in('checklist_id', chunk)
          .order('id', { ascending: true })

        if (errChunk) throw errChunk
        if (chunkTareas) {
          todasTareasData = todasTareasData.concat(chunkTareas)
        }
      }

      const mapaChecklists = new Map<number, any>()
      checklistsData.forEach((c: any) => {
        mapaChecklists.set(Number(c.id), c)
      })

      const hoyStr = new Date().toISOString().split('T')[0]

      // 5. Normalizar tareas reales
      const listaMapeada: TareaReporteItem[] = todasTareasData.map((t: any) => {
        const c = mapaChecklists.get(Number(t.checklist_id)) || {}
        const colabAsignadoId = Number(t.colaborador_responsable_id || c.colaborador_asignado_id || 0)
        const colabResuelveId = Number(t.colaborador_resuelve_id || 0)
        const colabAsignadoObj = mapaColabs.get(colabAsignadoId) || {}
        const colabResuelveObj = mapaColabs.get(colabResuelveId) || {}

        const proyNombre = mapaProys.get(Number(c.proyecto_id)) || 'Proyecto General'
        const chkId = Number(c.proyecto_checklist_id || t.proyecto_checklist_id || 0)
        const pcObj = mapaProyectoChecklists.get(chkId) || { nombre: 'Checklist General', color: '#3b82f6' }
        const tInfo = tareasCatMap.get(Number(t.tarea_id)) || {}

        const completada = Boolean(t.completada)
        let estadoTexto: 'Completada' | 'Pendiente' | 'No realizada' = 'Pendiente'
        if (completada) {
          estadoTexto = 'Completada'
        } else if (c.fecha && c.fecha < hoyStr) {
          estadoTexto = 'No realizada'
        }

        return {
          id: Number(t.id),
          checklistId: Number(t.checklist_id),
          fecha: c.fecha || '',
          dia: c.dia || '',
          proyectoId: Number(c.proyecto_id || 0),
          proyectoNombre: proyNombre,
          proyectoChecklistId: chkId || null,
          checklistNombre: pcObj.nombre,
          checklistColor: pcObj.color,
          colaboradorAsignadoId: colabAsignadoId,
          colaboradorAsignadoNombre: colabAsignadoObj.nombre || (colabAsignadoId ? `Colaborador #${colabAsignadoId}` : 'Sin Asignar'),
          colaboradorColor: getColaboradorColor(colabAsignadoId),
          colaboradorResuelveId: colabResuelveId || null,
          colaboradorResuelveNombre: colabResuelveObj.nombre || (completada ? colabAsignadoObj.nombre : null),
          tareaId: Number(t.tarea_id),
          tareaNombre: t.tarea_nombre_snapshot || tInfo.nombre || 'Tarea',
          tareaDescripcion: tInfo.descripcion || null,
          grupoId: t.grupo_id ? Number(t.grupo_id) : null,
          grupoNombre: t.grupo_nombre_snapshot || null,
          completada,
          completadaAt: t.completada_at,
          observaciones: t.observaciones || null,
          fotoUrl: t.foto_url || null,
          fotoPath: t.foto_path || null,
          estadoTexto
        }
      })

      tareas.value = listaMapeada
      return listaMapeada
    } catch (err) {
      console.error('Error al cargar reporte:', err)
      tareas.value = []
      incidencias.value = []
      throw err
    } finally {
      cargando.value = false
    }
  }

  // =========================================================================
  // MÉTRICAS 100% REALES DEL SISTEMA
  // =========================================================================

  const totalTareas = computed(() => tareas.value.length)
  
  const tareasCompletadas = computed(() => 
    tareas.value.filter(t => t.completada).length
  )
  
  const tareasPendientes = computed(() => 
    totalTareas.value - tareasCompletadas.value
  )
  
  const totalFotosEvidencia = computed(() => 
    tareas.value.filter(t => Boolean(t.fotoUrl)).length
  )

  const porcentajeCumplimiento = computed(() => {
    if (totalTareas.value === 0) return 0
    return Math.round((tareasCompletadas.value / totalTareas.value) * 100)
  })

  // Incidencias (Fallas Reales)
  const totalFallas = computed(() => incidencias.value.length)
  
  const fallasPendientes = computed(() => 
    incidencias.value.filter(i => i.estadoTexto === 'Pendiente').length
  )
  
  const fallasResueltas = computed(() => 
    incidencias.value.filter(i => i.estadoTexto === 'Listo').length
  )

  const subFallas = computed(() => {
    if (totalFallas.value === 0) return '0 pendientes'
    return `${fallasPendientes.value} pendiente${fallasPendientes.value !== 1 ? 's' : ''}`
  })

  // Resumen de Colaboradores 100% Real
  const resumenPorColaborador = computed<ColaboradorResumenReporte[]>(() => {
    const mapa = new Map<number, ColaboradorResumenReporte>()

    // 1. Inicializar con los colaboradores del catálogo de Supabase
    colaboradoresCatalogo.value.forEach((c: any) => {
      const cId = Number(c.id)
      mapa.set(cId, {
        colaboradorId: cId,
        nombre: c.nombre || 'Usuario',
        rol: c.rol || 'Colaborador',
        color: getColaboradorColor(cId),
        totalAsignadas: 0,
        completadas: 0,
        pendientes: 0,
        porcentaje: 0,
        totalFotos: 0,
        porcentajeFotos: 0,
        totalFallas: 0,
        totalMontajes: 0
      })
    })

    // 2. Sumar tareas reales asignadas en el período
    tareas.value.forEach(t => {
      const id = Number(t.colaboradorAsignadoId || 0)
      if (id > 0) {
        if (!mapa.has(id)) {
          mapa.set(id, {
            colaboradorId: id,
            nombre: t.colaboradorAsignadoNombre || `Colaborador #${id}`,
            rol: 'Colaborador',
            color: t.colaboradorColor,
            totalAsignadas: 0,
            completadas: 0,
            pendientes: 0,
            porcentaje: 0,
            totalFotos: 0,
            porcentajeFotos: 0,
            totalFallas: 0,
            totalMontajes: 0
          })
        }

        const item = mapa.get(id)!
        item.totalAsignadas += 1
        if (t.completada) {
          item.completadas += 1
        } else {
          item.pendientes += 1
        }
        if (t.fotoUrl) {
          item.totalFotos += 1
        }
      }
    })

    // 3. Contabilizar incidencias reales por colaborador
    incidencias.value.forEach(inc => {
      const id = Number(inc.colaboradorId || 0)
      if (id > 0) {
        if (!mapa.has(id)) {
          mapa.set(id, {
            colaboradorId: id,
            nombre: inc.colaboradorNombre || `Colaborador #${id}`,
            rol: 'Colaborador',
            color: inc.colaboradorColor,
            totalAsignadas: 0,
            completadas: 0,
            pendientes: 0,
            porcentaje: 0,
            totalFotos: 0,
            porcentajeFotos: 0,
            totalFallas: 0,
            totalMontajes: 0
          })
        }

        mapa.get(id)!.totalFallas += 1
      }
    })

    // 4. Contabilizar montajes reales por colaborador
    montajes.value.forEach(m => {
      const id = Number(m.colaborador_id || m.colaboradorId || 0)
      if (id > 0) {
        if (!mapa.has(id)) {
          mapa.set(id, {
            colaboradorId: id,
            nombre: m.colaborador_nombre || `Colaborador #${id}`,
            rol: 'Colaborador',
            color: getColaboradorColor(id),
            totalAsignadas: 0,
            completadas: 0,
            pendientes: 0,
            porcentaje: 0,
            totalFotos: 0,
            porcentajeFotos: 0,
            totalFallas: 0,
            totalMontajes: 0
          })
        }

        mapa.get(id)!.totalMontajes += 1
      }
    })

    return Array.from(mapa.values())
      .map(item => {
        const pct = item.totalAsignadas > 0 ? Math.round((item.completadas / item.totalAsignadas) * 100) : 0
        const pctFotos = item.completadas > 0 ? Math.round((item.totalFotos / item.completadas) * 100) : 0
        return {
          ...item,
          porcentaje: pct,
          porcentajeFotos: pctFotos
        }
      })
      .sort((a, b) => (b.totalAsignadas + b.totalMontajes) - (a.totalAsignadas + a.totalMontajes))
  })

  // Resumen agrupado por Tipo de Checklist 100% Real
  const resumenPorChecklist = computed<ChecklistResumenReporte[]>(() => {
    const mapa = new Map<string, ChecklistResumenReporte>()

    tareas.value.forEach(t => {
      const key = String(t.proyectoChecklistId || t.checklistNombre || 'general')
      if (!mapa.has(key)) {
        mapa.set(key, {
          id: t.proyectoChecklistId || 0,
          nombre: t.checklistNombre || 'Checklist General',
          color: t.checklistColor || '#3b82f6',
          total: 0,
          completadas: 0,
          pendientes: 0,
          porcentaje: 0
        })
      }

      const item = mapa.get(key)!
      item.total += 1
      if (t.completada) {
        item.completadas += 1
      } else {
        item.pendientes += 1
      }
    })

    return Array.from(mapa.values())
      .map(item => ({
        ...item,
        porcentaje: item.total > 0 ? Math.round((item.completadas / item.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
  })

  // Función para exportar los datos a CSV
  function exportarCSV(nombreArchivo = 'reporte-checklists') {
    if (tareas.value.length === 0) return

    const encabezados = [
      'Fecha',
      'Día',
      'Proyecto',
      'Checklist',
      'Tarea',
      'Grupo',
      'Colaborador Asignado',
      'Estado',
      'Resuelta Por',
      'Fecha Completada',
      'Tiene Evidencia',
      'URL Evidencia',
      'Observaciones'
    ]

    const filas = tareas.value.map(t => [
      `"${t.fecha}"`,
      `"${t.dia}"`,
      `"${(t.proyectoNombre || '').replace(/"/g, '""')}"`,
      `"${(t.checklistNombre || '').replace(/"/g, '""')}"`,
      `"${(t.tareaNombre || '').replace(/"/g, '""')}"`,
      `"${(t.grupoNombre || 'Individual').replace(/"/g, '""')}"`,
      `"${(t.colaboradorAsignadoNombre || '').replace(/"/g, '""')}"`,
      `"${t.estadoTexto}"`,
      `"${(t.colaboradorResuelveNombre || '').replace(/"/g, '""')}"`,
      `"${t.completadaAt || ''}"`,
      `"${t.fotoUrl ? 'Sí' : 'No'}"`,
      `"${t.fotoUrl || ''}"`,
      `"${(t.observaciones || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${nombreArchivo}-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    cargando,
    tareas,
    incidencias,
    colaboradoresCatalogo,
    totalTareas,
    tareasCompletadas,
    tareasPendientes,
    totalFotosEvidencia,
    porcentajeCumplimiento,
    totalFallas,
    fallasPendientes,
    fallasResueltas,
    subFallas,
    resumenPorColaborador,
    resumenPorChecklist,
    cargarDatosReporte,
    exportarCSV
  }
}
