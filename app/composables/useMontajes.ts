import { ref } from 'vue'

export interface Montaje {
  id: number
  proyecto_id: number
  colaborador_id?: number | null
  colaborador_nombre?: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  fecha_hora: string
  estado: string
  foto_url?: string | null
  foto_path?: string | null
  created_at?: string
  colaborador?: {
    id: number
    nombre: string
  } | null
}

export function useMontajes() {
  const supabase = useSupabaseClient()
  const cargando = ref(false)
  const montajes = ref<Montaje[]>([])

  /**
   * Sube fotografía de evidencia del montaje a Supabase Storage (bucket evidencias)
   */
  async function subirFotoMontaje(archivo: File, proyectoId: number | string) {
    const extension = archivo.name?.split('.').pop() || 'jpg'
    const ruta = `montajes/${proyectoId}-${Date.now()}.${extension}`

    const { error: errSubida } = await supabase.storage
      .from('evidencias')
      .upload(ruta, archivo, { upsert: true, contentType: archivo.type })

    if (errSubida) throw errSubida

    const { data } = supabase.storage.from('evidencias').getPublicUrl(ruta)
    return { foto_path: ruta, foto_url: data.publicUrl }
  }

  /**
   * Carga los montajes de un proyecto específico
   */
  async function cargarMontajesProyecto(proyectoId: number) {
    if (!proyectoId) return []
    cargando.value = true
    try {
      const { data, error } = await supabase
        .from('montajes')
        .select(`
          *,
          colaborador:colaboradores ( id, nombre )
        `)
        .eq('proyecto_id', proyectoId)
        .order('fecha', { ascending: false })
        .order('hora', { ascending: false })

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          // Tabla aún no creada en Supabase, cargar desde almacenamiento local de respaldo
          if (import.meta.client) {
            const raw = localStorage.getItem(`taskcc_montajes_${proyectoId}`)
            montajes.value = raw ? JSON.parse(raw) : []
            return montajes.value
          }
          montajes.value = []
          return []
        }
        console.warn('Aviso al cargar montajes:', error.message)
        montajes.value = []
        return []
      }

      montajes.value = (data || []).map((m: any) => ({
        ...m,
        colaborador_nombre: m.colaborador?.nombre || 'Sin asignar'
      }))
      return montajes.value
    } catch (err) {
      console.error('Error al cargar montajes:', err)
      montajes.value = []
      return []
    } finally {
      cargando.value = false
    }
  }

  /**
   * Registra un nuevo montaje
   */
  async function crearMontaje({
    proyectoId,
    colaboradorId,
    titulo = 'Montaje',
    descripcion,
    fecha,
    hora,
    estado = 'completado',
    archivo = null
  }: {
    proyectoId: number
    colaboradorId?: number | null
    titulo?: string
    descripcion: string
    fecha: string
    hora: string
    estado?: string
    archivo?: File | null
  }) {
    cargando.value = true
    try {
      let foto_path = null
      let foto_url = null

      if (archivo) {
        const uploadRes = await subirFotoMontaje(archivo, proyectoId)
        foto_path = uploadRes.foto_path
        foto_url = uploadRes.foto_url
      }

      const ahora = new Date()
      const fechaFinal = fecha || ahora.toISOString().split('T')[0]
      const horaFinal = hora || ahora.toTimeString().split(' ')[0].substring(0, 5)

      const payload = {
        proyecto_id: Number(proyectoId),
        colaborador_id: colaboradorId ? Number(colaboradorId) : null,
        titulo: (titulo || 'Montaje').trim(),
        descripcion: descripcion.trim(),
        fecha: fechaFinal,
        hora: horaFinal,
        fecha_hora: `${fechaFinal}T${horaFinal}:00`,
        estado,
        foto_path,
        foto_url
      }

      const { data, error } = await supabase
        .from('montajes')
        .insert(payload)
        .select(`
          *,
          colaborador:colaboradores ( id, nombre )
        `)
        .single()

      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          // Respaldo local
          const nuevoObj: Montaje = {
            id: Date.now(),
            proyecto_id: Number(proyectoId),
            colaborador_id: colaboradorId ? Number(colaboradorId) : null,
            titulo: payload.titulo,
            descripcion: payload.descripcion,
            fecha: payload.fecha,
            hora: payload.hora,
            fecha_hora: payload.fecha_hora,
            estado: payload.estado,
            foto_path,
            foto_url,
            created_at: ahora.toISOString()
          }
          if (import.meta.client) {
            const raw = localStorage.getItem(`taskcc_montajes_${proyectoId}`)
            const list: Montaje[] = raw ? JSON.parse(raw) : []
            list.unshift(nuevoObj)
            localStorage.setItem(`taskcc_montajes_${proyectoId}`, JSON.stringify(list))
            montajes.value = list
          }
          return nuevoObj
        }
        throw error
      }

      const itemFormateado = {
        ...data,
        colaborador_nombre: data.colaborador?.nombre || 'Sin asignar'
      }
      montajes.value.unshift(itemFormateado)
      return itemFormateado as Montaje
    } finally {
      cargando.value = false
    }
  }

  /**
   * Elimina un montaje por ID
   */
  async function eliminarMontaje(montajeId: number, proyectoId: number) {
    try {
      const { error } = await supabase
        .from('montajes')
        .delete()
        .eq('id', montajeId)

      if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
        if (import.meta.client) {
          const raw = localStorage.getItem(`taskcc_montajes_${proyectoId}`)
          let list: Montaje[] = raw ? JSON.parse(raw) : []
          list = list.filter(m => m.id !== montajeId)
          localStorage.setItem(`taskcc_montajes_${proyectoId}`, JSON.stringify(list))
          montajes.value = list
        }
        return
      }

      montajes.value = montajes.value.filter(m => m.id !== montajeId)
    } catch (err) {
      console.error('Error al eliminar montaje:', err)
      throw err
    }
  }

  return {
    cargando,
    montajes,
    cargarMontajesProyecto,
    crearMontaje,
    eliminarMontaje
  }
}
