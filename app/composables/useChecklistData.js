// composables/useChecklistData.js
//
// Toda la conexión a Supabase para la vista de Checklist vive aquí:
// obtener checklists por proyecto y fecha, leer y modificar tareas.

export function useChecklistData() {
  const supabase = useSupabaseClient()

  // 1. Obtener la lista de checklists definidos/creados para el proyecto
  async function obtenerChecklistsProyecto(proyectoId) {
    const { data, error } = await supabase
      .from('proyecto_checklists')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .eq('activo', true)
      .order('id', { ascending: true })

    if (error) throw error

    // Si no tiene ninguno creado aún, creamos automáticamente uno por defecto
    if (!data || data.length === 0) {
      const { data: defaultChecklist, error: errCrear } = await supabase
        .from('proyecto_checklists')
        .insert({
          proyecto_id: proyectoId,
          nombre: 'Checklist General',
          descripcion: 'Checklist principal de operaciones',
          color: '#3b82f6'
        })
        .select()
        .single()

      if (!errCrear && defaultChecklist) {
        return [defaultChecklist]
      }
    }

    return data || []
  }

  // 2. Crear un nuevo checklist para el proyecto
  async function crearProyectoChecklist(proyectoId, { nombre, descripcion, color = '#3b82f6', icono = 'clipboard', gruposIds = [] }) {
    const { data, error } = await supabase
      .from('proyecto_checklists')
      .insert({
        proyecto_id: proyectoId,
        nombre: nombre.trim(),
        descripcion: (descripcion || '').trim(),
        color,
        icono,
        activo: true
      })
      .select()
      .single()

    if (error) throw error

    // Si se seleccionaron grupos para asociarlos a este checklist
    if (gruposIds && gruposIds.length > 0) {
      await supabase
        .from('grupos')
        .update({ proyecto_checklist_id: data.id })
        .in('id', gruposIds)
    }

    return data
  }

  // 3. Eliminar un checklist del proyecto
  async function eliminarProyectoChecklist(checklistId) {
    const { error } = await supabase
      .from('proyecto_checklists')
      .update({ activo: false })
      .eq('id', checklistId)

    if (error) throw error
  }

  async function obtenerTareasDeChecklists(checklistIds) {
    if (!checklistIds.length) return []
    const { data, error } = await supabase
      .from('checklist_tareas')
      .select(`
        id,
        checklist_id,
        proyecto_checklist_id,
        completada,
        completada_at,
        observaciones,
        foto_url,
        foto_path,
        colaborador_resuelve_id,
        tarea_nombre_snapshot,
        grupo_nombre_snapshot,
        tarea:tareas ( id, nombre, descripcion )
      `)
      .in('checklist_id', checklistIds)
      .order('id', { ascending: true })

    if (error) throw error
    return data
  }

  // Trae todos los checklists de una semana para un proyecto específico (opcionalmente filtrado por proyectoChecklistId)
  async function cargarSemanaProyecto(proyectoId, diasSemana, proyectoChecklistId = null) {
    const fechas = diasSemana.map(d => d.fecha)
    
    let query = supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        proyecto_checklist_id,
        colaborador_asignado_id,
        colaborador:colaboradores ( nombre )
      `)
      .eq('proyecto_id', proyectoId)
      .in('fecha', fechas)

    if (proyectoChecklistId && proyectoChecklistId !== 'todos') {
      const chkIdNum = Number(proyectoChecklistId)
      query = query.eq('proyecto_checklist_id', chkIdNum)
    }
      
    const { data: checklists, error: errChecklists } = await query
      
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
      
      const tareasDelDia = []
      checklistsDelDia.forEach(checklist => {
        const tareas = tareasPorChecklist[checklist.id] || []
        const tareasConMetadata = tareas.map(t => ({
          ...t,
          colaboradorId: checklist.colaborador_asignado_id,
          colaboradorNombre: checklist.colaborador?.nombre || 'Desconocido',
          checklistId: checklist.id,
          proyectoChecklistId: checklist.proyecto_checklist_id
        }))
        tareasDelDia.push(...tareasConMetadata)
      })

      return {
        ...dia,
        checklists: checklistsDelDia,
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

  async function marcarComoHecha(checklistTareaId, archivo, colaboradorId, observaciones = null) {
    const { foto_path, foto_url } = await subirFotoEvidencia(archivo, checklistTareaId)

    const updatePayload = {
      completada: true,
      completada_at: new Date().toISOString(),
      colaborador_resuelve_id: colaboradorId,
      foto_path,
      foto_url,
    }

    if (observaciones !== undefined && observaciones !== null && typeof observaciones === 'string' && observaciones.trim() !== '') {
      updatePayload.observaciones = observaciones.trim()
    }

    const { data, error } = await supabase
      .from('checklist_tareas')
      .update(updatePayload)
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

  async function crearChecklist(proyectoId, colaboradorId, fecha, proyectoChecklistId = null) {
    const targetChecklistId = (proyectoChecklistId && proyectoChecklistId !== 'todos') ? Number(proyectoChecklistId) : null

    const { data, error } = await supabase
      .from('checklists')
      .insert({ 
        proyecto_id: proyectoId, 
        colaborador_asignado_id: colaboradorId, 
        fecha,
        proyecto_checklist_id: targetChecklistId 
      })
      .select('id, fecha, dia, proyecto_checklist_id')
      .single()
    if (error) throw error
    return data
  }

  // Trae todos los checklists de un rango de fechas para un proyecto
  async function cargarRangoProyecto(proyectoId, fechaInicio, fechaFin, proyectoChecklistId = null) {
    let query = supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        proyecto_checklist_id,
        colaborador_asignado_id,
        colaborador:colaboradores ( nombre )
      `)
      .eq('proyecto_id', proyectoId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)

    if (proyectoChecklistId && proyectoChecklistId !== 'todos') {
      const chkIdNum = Number(proyectoChecklistId)
      query = query.eq('proyecto_checklist_id', chkIdNum)
    }
      
    const { data: checklists, error: errChecklists } = await query
      
    if (errChecklists) throw errChecklists

    const checklistIds = (checklists || []).map(c => c.id)
    const todasLasTareas = await obtenerTareasDeChecklists(checklistIds)

    const tareasPorChecklist = todasLasTareas.reduce((acc, tarea) => {
      if (!acc[tarea.checklist_id]) acc[tarea.checklist_id] = []
      acc[tarea.checklist_id].push(tarea)
      return acc
    }, {})

    const eventos = []
    const listaChecklists = checklists || []
    for (const checklist of listaChecklists) {
      const tareas = tareasPorChecklist[checklist.id] || []
      for (const t of tareas) {
        eventos.push({
          ...t,
          fecha: checklist.fecha,
          colaboradorId: checklist.colaborador_asignado_id,
          colaboradorNombre: checklist.colaborador?.nombre || 'Desconocido',
          checklistId: checklist.id,
          proyectoChecklistId: checklist.proyecto_checklist_id
        })
      }
    }

    return eventos
  }

  // Asignar tareas a colaboradores con soporte para proyectoChecklistId
  async function asignarTareasSemanal({ proyectoId, proyectoChecklistId = null, colaboradorIds, fechas, items }) {
    if (!colaboradorIds?.length || !fechas?.length || !items?.length) return 0
    let totalInsertadas = 0

    // Si proyectoChecklistId no viene definido o es 'todos', obtenemos el checklist por defecto del proyecto
    let targetChecklistId = (proyectoChecklistId && proyectoChecklistId !== 'todos') ? Number(proyectoChecklistId) : null
    if (!targetChecklistId) {
      const checklists = await obtenerChecklistsProyecto(proyectoId)
      if (checklists && checklists.length > 0) {
        targetChecklistId = checklists[0].id
      }
    }

    for (const colabId of colaboradorIds) {
      for (const fecha of fechas) {
        // 1. Obtener o crear checklist para (colaborador_asignado_id, fecha, proyecto_id, proyecto_checklist_id)
        let checkQuery = supabase
          .from('checklists')
          .select('id')
          .eq('proyecto_id', proyectoId)
          .eq('colaborador_asignado_id', colabId)
          .eq('fecha', fecha)

        if (targetChecklistId) {
          checkQuery = checkQuery.eq('proyecto_checklist_id', targetChecklistId)
        } else {
          checkQuery = checkQuery.is('proyecto_checklist_id', null)
        }

        let { data: checklist, error: errC } = await checkQuery.maybeSingle()

        if (errC) throw errC

        if (!checklist) {
          const { data: nuevoChecklist, error: errCrear } = await supabase
            .from('checklists')
            .insert({
              proyecto_id: proyectoId,
              colaborador_asignado_id: colabId,
              fecha: fecha,
              proyecto_checklist_id: targetChecklistId || null
            })
            .select('id')
            .single()

          if (errCrear) throw errCrear
          checklist = nuevoChecklist
        }

        // 2. Obtener tareas ya existentes en este checklist para evitar duplicados
        const { data: existentes, error: errExistentes } = await supabase
          .from('checklist_tareas')
          .select('tarea_id, grupo_id')
          .eq('checklist_id', checklist.id)

        if (errExistentes) throw errExistentes

        const clavesExistentes = new Set(
          (existentes || []).map(e => `${e.tarea_id}_${e.grupo_id || 'null'}`)
        )

        // 3. Filtrar y preparar filas a insertar
        const filasNuevas = items
          .filter(it => !clavesExistentes.has(`${it.tareaId}_${it.grupoId || 'null'}`))
          .map(it => ({
            checklist_id: checklist.id,
            proyecto_checklist_id: targetChecklistId || null,
            tarea_id: it.tareaId,
            grupo_id: it.grupoId || null,
            tarea_nombre_snapshot: it.tareaNombre,
            grupo_nombre_snapshot: it.grupoNombre || null,
            completada: false
          }))

        if (filasNuevas.length > 0) {
          const { data: insertadas, error: errInsertar } = await supabase
            .from('checklist_tareas')
            .insert(filasNuevas)
            .select('id')

          if (errInsertar) throw errInsertar
          totalInsertadas += (insertadas?.length || 0)
        }
      }
    }

    return totalInsertadas
  }

  // Trae las tareas asignadas para un colaborador específico en las fechas de una semana
  async function obtenerAsignacionesSemanaColaborador(proyectoId, colaboradorId, fechas, proyectoChecklistId = null) {
    if (!colaboradorId || !fechas?.length) return {}

    let query = supabase
      .from('checklists')
      .select('id, fecha, dia, proyecto_checklist_id')
      .eq('proyecto_id', proyectoId)
      .eq('colaborador_asignado_id', colaboradorId)
      .in('fecha', fechas)

    if (proyectoChecklistId && proyectoChecklistId !== 'todos') {
      const chkIdNum = Number(proyectoChecklistId)
      query = query.eq('proyecto_checklist_id', chkIdNum)
    }

    const { data: checklists, error: errChecklists } = await query

    if (errChecklists) throw errChecklists
    if (!checklists?.length) return {}

    const checklistIds = checklists.map(c => c.id)
    const tareas = await obtenerTareasDeChecklists(checklistIds)

    const mapaChecklistsPorId = checklists.reduce((acc, c) => {
      acc[c.id] = c.fecha
      return acc
    }, {})

    const resultadoPorFecha = {}
    fechas.forEach(f => { resultadoPorFecha[f] = [] })

    tareas.forEach(t => {
      const fecha = mapaChecklistsPorId[t.checklist_id]
      if (fecha && resultadoPorFecha[fecha]) {
        resultadoPorFecha[fecha].push(t)
      }
    })

    return resultadoPorFecha
  }

  // Trae todos los checklists y tareas de una semana para un colaborador específico
  async function cargarSemanaColaborador(colaboradorId, diasSemana, proyectoId = null) {
    if (!colaboradorId || !diasSemana?.length) return []
    const fechas = diasSemana.map(d => d.fecha)

    let query = supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        proyecto_id,
        proyecto_checklist_id,
        colaborador_asignado_id,
        proyecto:proyectos ( id, nombre )
      `)
      .eq('colaborador_asignado_id', colaboradorId)
      .in('fecha', fechas)

    if (proyectoId && proyectoId !== 'todos') {
      query = query.eq('proyecto_id', Number(proyectoId))
    }

    const { data: checklists, error: errChecklists } = await query
    if (errChecklists) throw errChecklists

    const checklistIds = (checklists || []).map(c => c.id)
    const todasLasTareas = await obtenerTareasDeChecklists(checklistIds)

    const tareasPorChecklist = todasLasTareas.reduce((acc, tarea) => {
      if (!acc[tarea.checklist_id]) acc[tarea.checklist_id] = []
      acc[tarea.checklist_id].push(tarea)
      return acc
    }, {})

    const resultado = diasSemana.map(dia => {
      const checklistsDelDia = (checklists || []).filter(c => c.fecha === dia.fecha)
      const tareasDelDia = []

      checklistsDelDia.forEach(checklist => {
        const tareas = tareasPorChecklist[checklist.id] || []
        const tareasConMetadata = tareas.map(t => ({
          ...t,
          fecha: checklist.fecha,
          dia: checklist.dia,
          checklistId: checklist.id,
          proyectoId: checklist.proyecto_id,
          proyectoNombre: checklist.proyecto?.nombre || 'General'
        }))
        tareasDelDia.push(...tareasConMetadata)
      })

      return {
        ...dia,
        checklists: checklistsDelDia,
        tareas: tareasDelDia
      }
    })

    return resultado
  }

  // Trae todas las tareas de un rango de fechas para un colaborador específico (calendario mensual)
  async function cargarRangoColaborador(colaboradorId, fechaInicio, fechaFin, proyectoId = null) {
    if (!colaboradorId) return []

    let query = supabase
      .from('checklists')
      .select(`
        id, 
        fecha, 
        dia, 
        proyecto_id,
        proyecto_checklist_id,
        colaborador_asignado_id,
        proyecto:proyectos ( id, nombre )
      `)
      .eq('colaborador_asignado_id', colaboradorId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)

    if (proyectoId && proyectoId !== 'todos') {
      query = query.eq('proyecto_id', Number(proyectoId))
    }

    const { data: checklists, error: errChecklists } = await query
    if (errChecklists) throw errChecklists

    const checklistIds = (checklists || []).map(c => c.id)
    const todasLasTareas = await obtenerTareasDeChecklists(checklistIds)

    const tareasPorChecklist = todasLasTareas.reduce((acc, tarea) => {
      if (!acc[tarea.checklist_id]) acc[tarea.checklist_id] = []
      acc[tarea.checklist_id].push(tarea)
      return acc
    }, {})

    const eventos = []
    const listaChecklists = checklists || []
    for (const checklist of listaChecklists) {
      const tareas = tareasPorChecklist[checklist.id] || []
      for (const t of tareas) {
        eventos.push({
          ...t,
          fecha: checklist.fecha,
          dia: checklist.dia,
          checklistId: checklist.id,
          proyectoId: checklist.proyecto_id,
          proyectoNombre: checklist.proyecto?.nombre || 'General'
        })
      }
    }

    return eventos
  }

  return {
    obtenerChecklistsProyecto,
    crearProyectoChecklist,
    eliminarProyectoChecklist,
    cargarSemanaProyecto,
    cargarGrupoPredeterminado,
    agregarTareaSuelta,
    quitarTarea,
    marcarComoHecha,
    desmarcarTarea,
    crearChecklist,
    cargarRangoProyecto,
    asignarTareasSemanal,
    obtenerAsignacionesSemanaColaborador,
    cargarSemanaColaborador,
    cargarRangoColaborador
  }
}
