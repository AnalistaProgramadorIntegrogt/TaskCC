// composables/useIncidencias.ts
//
// Gestión de incidencias: creación, subida de evidencia fotográfica
// y consulta filtrada por colaborador y rango de fechas con detección segura de existencia de tabla.

export interface Incidencia {
  id: number
  colaborador_id: number
  proyecto_id?: number | null
  checklist_tarea_id?: number | null
  titulo: string
  descripcion?: string | null
  foto_url?: string | null
  foto_path?: string | null
  fecha: string
  hora: string
  fecha_hora: string
  estado: string
  created_at: string
  proyecto?: {
    id: number
    nombre: string
  } | null
}

// Bandera en memoria para no saturar con 404 si la tabla aún no se ha creado en Supabase
let incidenciasTableMissing = false

export function useIncidencias() {
  const supabase = useSupabaseClient()

  /**
   * Sube la fotografía de la incidencia a Supabase Storage (bucket evidencias)
   */
  async function subirFotoIncidencia(archivo: File, colaboradorId: number | string) {
    const extension = archivo.name?.split('.').pop() || 'jpg'
    const ruta = `incidencias/${colaboradorId}-${Date.now()}.${extension}`

    const { error: errSubida } = await supabase.storage
      .from('evidencias')
      .upload(ruta, archivo, { upsert: true, contentType: archivo.type })

    if (errSubida) throw errSubida

    const { data } = supabase.storage.from('evidencias').getPublicUrl(ruta)
    return { foto_path: ruta, foto_url: data.publicUrl }
  }

  /**
   * Registra una nueva incidencia con soporte para evidencia fotográfica
   */
  async function crearIncidencia({
    colaboradorId,
    proyectoId = null,
    checklistTareaId = null,
    titulo,
    descripcion = '',
    archivo = null,
    fecha = null,
    hora = null
  }: {
    colaboradorId: number
    proyectoId?: number | null
    checklistTareaId?: number | null
    titulo: string
    descripcion?: string
    archivo?: File | null
    fecha?: string | null
    hora?: string | null
  }) {
    let foto_path = null
    let foto_url = null

    if (archivo) {
      const uploadResult = await subirFotoIncidencia(archivo, colaboradorId)
      foto_path = uploadResult.foto_path
      foto_url = uploadResult.foto_url
    }

    const ahora = new Date()
    const fechaFinal = fecha || ahora.toISOString().split('T')[0]
    const horaFinal = hora || ahora.toTimeString().split(' ')[0].substring(0, 5)

    const { data, error } = await supabase
      .from('incidencias')
      .insert({
        colaborador_id: colaboradorId,
        proyecto_id: proyectoId ? Number(proyectoId) : null,
        checklist_tarea_id: checklistTareaId ? Number(checklistTareaId) : null,
        titulo: titulo.trim(),
        descripcion: (descripcion || '').trim(),
        foto_path,
        foto_url,
        fecha: fechaFinal,
        hora: horaFinal,
        fecha_hora: ahora.toISOString(),
        estado: 'abierta'
      })
      .select(`
        *,
        proyecto:proyectos ( id, nombre )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('404')) {
        incidenciasTableMissing = true
        throw new Error("La tabla 'incidencias' no existe aún en Supabase. Debes ejecutar el archivo sql/010_incidencias.sql en el Editor SQL de Supabase.")
      }
      throw error
    }

    incidenciasTableMissing = false
    return data as Incidencia
  }

  /**
   * Obtiene incidencias de un colaborador en un rango de fechas (para el calendario mensual)
   */
  async function obtenerIncidenciasUsuarioRango(
    colaboradorId: number,
    fechaInicio: string,
    fechaFin: string
  ): Promise<Incidencia[]> {
    if (!colaboradorId || incidenciasTableMissing) return []

    try {
      const { data, error } = await supabase
        .from('incidencias')
        .select(`
          *,
          proyecto:proyectos ( id, nombre )
        `)
        .eq('colaborador_id', colaboradorId)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha_hora', { ascending: true })

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('404')) {
          incidenciasTableMissing = true
          return []
        }
        console.warn('Aviso al cargar incidencias por rango:', error.message)
        return []
      }

      return (data || []) as Incidencia[]
    } catch {
      return []
    }
  }

  /**
   * Obtiene incidencias de un colaborador para una lista de fechas (para la vista semanal)
   */
  async function obtenerIncidenciasUsuarioSemana(
    colaboradorId: number,
    fechasSemana: string[]
  ): Promise<Incidencia[]> {
    if (!colaboradorId || !fechasSemana.length || incidenciasTableMissing) return []

    try {
      const { data, error } = await supabase
        .from('incidencias')
        .select(`
          *,
          proyecto:proyectos ( id, nombre )
        `)
        .eq('colaborador_id', colaboradorId)
        .in('fecha', fechasSemana)
        .order('fecha_hora', { ascending: true })

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('404')) {
          incidenciasTableMissing = true
          return []
        }
        console.warn('Aviso al cargar incidencias por semana:', error.message)
        return []
      }

      return (data || []) as Incidencia[]
    } catch {
      return []
    }
  }

  return {
    subirFotoIncidencia,
    crearIncidencia,
    obtenerIncidenciasUsuarioRango,
    obtenerIncidenciasUsuarioSemana
  }
}
