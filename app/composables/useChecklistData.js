// composables/useChecklistData.js
//
// Toda la conexión a Supabase para la vista de Checklist vive aquí:
// obtener checklists por proyecto y fecha, leer y modificar tareas.

export function useChecklistData() {
  const supabase = useSupabaseClient()

  async function obtenerTareasDeChecklists(checklistIds) {
    if (!checklistIds.length) return []
    const { data, error } = await supabase
      .from('checklist_tareas')
      .select(`
        id,
        checklist_id,
        completada,
        completada_at,
        observaciones,
        foto_url,
        foto_path,
        colaborador_resuelve_id,
        tarea:tareas ( id, nombre, descripcion )
      `)
      .in('checklist_id', checklistIds)
      .order('id', { ascending: true })

    if (error) throw error
    return data
  }

  // Trae todos los checklists de una semana para un proyecto específico
  async function cargarSemanaProyecto(proyectoId, diasSemana) {
    const fechas = diasSemana.map(d => d.fecha)
    
    // Obtener todos los checklists para esa semana en el proyecto
    const { data: checklists, error: errChecklists } = await supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        colaborador_asignado_id,
        colaborador:colaboradores ( nombre )
      `)
      .eq('proyecto_id', proyectoId)
      .in('fecha', fechas)
      
    if (errChecklists) throw errChecklists

    const checklistIds = (checklists || []).map(c => c.id)
    const todasLasTareas = await obtenerTareasDeChecklists(checklistIds)

    // Agrupar tareas por checklist_id
    const tareasPorChecklist = todasLasTareas.reduce((acc, tarea) => {
      if (!acc[tarea.checklist_id]) acc[tarea.checklist_id] = []
      acc[tarea.checklist_id].push(tarea)
      return acc
    }, {})

    // Enriquecer el array de días con los checklists y tareas de ese día
    const resultado = diasSemana.map(dia => {
      const checklistsDelDia = (checklists || []).filter(c => c.fecha === dia.fecha)
      
      // Construir una lista combinada de tareas para este día
      const tareasDelDia = []
      checklistsDelDia.forEach(checklist => {
        const tareas = tareasPorChecklist[checklist.id] || []
        // Añadir metadata del colaborador a cada tarea para poder pintarla en la interfaz
        const tareasConMetadata = tareas.map(t => ({
          ...t,
          colaboradorId: checklist.colaborador_asignado_id,
          colaboradorNombre: checklist.colaborador?.nombre || 'Desconocido',
          checklistId: checklist.id
        }))
        tareasDelDia.push(...tareasConMetadata)
      })

      return {
        ...dia,
        checklists: checklistsDelDia, // Puede ser útil tener la lista de checklists
        tareas: tareasDelDia
      }
    })

    return resultado
  }

  // Inserta en un checklist las tareas del grupo marcado como predeterminado
  async function cargarGrupoPredeterminado(proyectoId, checklistId) {
    const { data: grupo, error: errGrupo } = await supabase
      .from('grupos')
      .select('id')
      .eq('proyecto_id', proyectoId)
      .eq('es_predeterminado', true)
      .eq('activo', true)
      .maybeSingle()

    if (errGrupo) throw errGrupo
    if (!grupo) return []

    const { data: tareasGrupo, error: errTareas } = await supabase
      .from('tareas_recurrentes')
      .select('tarea_id')
      .eq('grupo_id', grupo.id)
      .order('orden', { ascending: true })

    if (errTareas) throw errTareas
    if (!tareasGrupo?.length) return []

    const { data: yaExistentes } = await supabase
      .from('checklist_tareas')
      .select('tarea_id')
      .eq('checklist_id', checklistId)

    const idsExistentes = new Set((yaExistentes || []).map(t => t.tarea_id))
    const filasNuevas = tareasGrupo
      .map(t => t.tarea_id)
      .filter(id => !idsExistentes.has(id))
      .map(tarea_id => ({ checklist_id: checklistId, tarea_id }))

    if (!filasNuevas.length) return []

    const { data: insertadas, error: errInsertar } = await supabase
      .from('checklist_tareas')
      .insert(filasNuevas)
      .select('id, completada, foto_url, foto_path, tarea:tareas ( id, nombre, descripcion )')

    if (errInsertar) throw errInsertar
    return insertadas
  }

  // Agrega una tarea suelta
  async function agregarTareaSuelta(checklistId, tareaId) {
    const { data, error } = await supabase
      .from('checklist_tareas')
      .insert({ checklist_id: checklistId, tarea_id: tareaId })
      .select('id, completada, foto_url, foto_path, tarea:tareas ( id, nombre, descripcion )')
      .single()

    if (error) throw error
    return data
  }

  async function quitarTarea(checklistTareaId) {
    const { error } = await supabase.from('checklist_tareas').delete().eq('id', checklistTareaId)
    if (error) throw error
  }

  async function subirFotoEvidencia(archivo, checklistTareaId) {
    const extension = archivo.name?.split('.').pop() || 'jpg'
    const ruta = `evidencias/${checklistTareaId}-${Date.now()}.${extension}`

    const { error: errSubida } = await supabase.storage
      .from('evidencias')
      .upload(ruta, archivo, { upsert: true, contentType: archivo.type })

    if (errSubida) throw errSubida

    const { data } = supabase.storage.from('evidencias').getPublicUrl(ruta)
    return { foto_path: ruta, foto_url: data.publicUrl }
  }

  async function marcarComoHecha(checklistTareaId, archivo, colaboradorId) {
    const { foto_path, foto_url } = await subirFotoEvidencia(archivo, checklistTareaId)

    const { data, error } = await supabase
      .from('checklist_tareas')
      .update({
        completada: true,
        completada_at: new Date().toISOString(),
        colaborador_resuelve_id: colaboradorId, // Quién la resolvió
        foto_path,
        foto_url,
      })
      .eq('id', checklistTareaId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function desmarcarTarea(checklistTareaId) {
    const { data, error } = await supabase
      .from('checklist_tareas')
      .update({ completada: false, completada_at: null, foto_path: null, foto_url: null })
      .eq('id', checklistTareaId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Nueva utilidad: para cuando necesitamos asignar algo y no hay checklist aún
  async function crearChecklist(proyectoId, colaboradorId, fecha) {
    const { data, error } = await supabase
      .from('checklists')
      .insert({ proyecto_id: proyectoId, colaborador_asignado_id: colaboradorId, fecha })
      .select('id, fecha, dia')
      .single()
    if (error) throw error
    return data
  }

  // Trae todos los checklists de un rango de fechas para un proyecto (ej. mes completo)
  async function cargarRangoProyecto(proyectoId, fechaInicio, fechaFin) {
    const { data: checklists, error: errChecklists } = await supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        colaborador_asignado_id,
        colaborador:colaboradores ( nombre )
      `)
      .eq('proyecto_id', proyectoId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      
    if (errChecklists) throw errChecklists

    const checklistIds = (checklists || []).map(c => c.id)
    const todasLasTareas = await obtenerTareasDeChecklists(checklistIds)

    // Agrupar tareas por checklist_id
    const tareasPorChecklist = todasLasTareas.reduce((acc, tarea) => {
      if (!acc[tarea.checklist_id]) acc[tarea.checklist_id] = []
      acc[tarea.checklist_id].push(tarea)
      return acc
    }, {})

    // Construir una lista plana de eventos enriquecida con la fecha y colaborador
    const eventos = []
    checklists.forEach(checklist => {
      const tareas = tareasPorChecklist[checklist.id] || []
      tareas.forEach(t => {
        eventos.push({
          ...t,
          fecha: checklist.fecha, // Para que el calendario pueda agrupar por fecha
          colaboradorId: checklist.colaborador_asignado_id,
          colaboradorNombre: checklist.colaborador?.nombre || 'Desconocido',
          checklistId: checklist.id
        })
      })
    })

    return eventos
  }

  return {
    cargarSemanaProyecto,
    cargarGrupoPredeterminado,
    agregarTareaSuelta,
    quitarTarea,
    marcarComoHecha,
    desmarcarTarea,
    crearChecklist,
    cargarRangoProyecto
  }
}
