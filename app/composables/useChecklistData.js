// composables/useChecklistData.js
//
// Toda la conexión a Supabase para la vista de Checklist vive aquí:
// obtener/crear checklists por día, leer y modificar sus tareas,
// cargar el grupo de tareas recurrentes por defecto, y subir la
// evidencia fotográfica al marcar una tarea como hecha.

export function useChecklistData() {
  const supabase = useSupabaseClient()

  async function obtenerOCrearChecklist(colaboradorId, fecha) {
    const { data: existente, error: errBuscar } = await supabase
      .from('checklists')
      .select('id, fecha, dia')
      .eq('colaborador_asignado_id', colaboradorId)
      .eq('fecha', fecha)
      .maybeSingle()

    if (errBuscar) throw errBuscar
    if (existente) return existente

    const { data: creado, error: errCrear } = await supabase
      .from('checklists')
      .insert({ colaborador_asignado_id: colaboradorId, fecha })
      .select('id, fecha, dia')
      .single()

    if (errCrear) throw errCrear
    return creado
  }

  async function obtenerTareasDeChecklist(checklistId) {
    const { data, error } = await supabase
      .from('checklist_tareas')
      .select(`
        id,
        completada,
        completada_at,
        observaciones,
        foto_url,
        foto_path,
        colaborador_resuelve_id,
        tarea:tareas ( id, nombre, descripcion )
      `)
      .eq('checklist_id', checklistId)
      .order('id', { ascending: true })

    if (error) throw error
    return data
  }

  // Trae (o crea) el checklist de cada día de la semana y sus tareas.
  async function cargarSemana(colaboradorId, diasSemana) {
    const resultado = []
    for (const dia of diasSemana) {
      const checklist = await obtenerOCrearChecklist(colaboradorId, dia.fecha)
      const tareas = await obtenerTareasDeChecklist(checklist.id)
      resultado.push({ ...dia, checklistId: checklist.id, tareas })
    }
    return resultado
  }

  // Inserta en el checklist las tareas del grupo marcado como predeterminado,
  // evitando duplicar las que ya estén presentes.
  async function cargarGrupoPredeterminado(checklistId) {
    const { data: grupo, error: errGrupo } = await supabase
      .from('grupos')
      .select('id')
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

  // Agrega una tarea suelta (ya existente en el catálogo) al checklist del día.
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
        colaborador_resuelve_id: colaboradorId,
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

  return {
    cargarSemana,
    cargarGrupoPredeterminado,
    agregarTareaSuelta,
    quitarTarea,
    marcarComoHecha,
    desmarcarTarea,
  }
}
