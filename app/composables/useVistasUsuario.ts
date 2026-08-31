import { computed, watch } from 'vue'
import { 
  Users, 
  ShieldCheck, 
  FolderKanban, 
  CheckSquare, 
  LayoutDashboard, 
  Layers, 
  BarChart3,
  CalendarDays
} from 'lucide-vue-next'

export interface VistaItem {
  id?: number
  nombre: string
  ruta: string
  categoria?: string
  descripcion?: string
}

export const DEFAULT_VISTAS: VistaItem[] = [
  { id: 1, nombre: 'Inicio / Panel General', ruta: '/admin', categoria: 'General', descripcion: 'Panel principal con directorio y accesos rápidos' },
  { id: 2, nombre: 'Mis Tareas y Calendario', ruta: '/', categoria: 'Operaciones', descripcion: 'Calendario personal, tareas asignadas e incidencias' },
  { id: 3, nombre: 'Checklists Diarios', ruta: '/checklists', categoria: 'Operaciones', descripcion: 'Formulario y seguimiento de checklists diarios' },
  { id: 4, nombre: 'Auditoría de Tareas', ruta: '/admin/auditoria', categoria: 'Operaciones', descripcion: 'Auditoría, revisión y calificación de tareas completadas' },
  { id: 5, nombre: 'Reportería y Métricas', ruta: '/admin/reportes', categoria: 'Operaciones', descripcion: 'Seguimiento, asignaciones y cumplimiento de checklists' },
  { id: 6, nombre: 'Gestión de Proyectos', ruta: '/admin/proyectos', categoria: 'Administración', descripcion: 'Configuración de proyectos, tareas y logos' },
  { id: 7, nombre: 'Gestión de Usuarios', ruta: '/admin/usuarios', categoria: 'Administración', descripcion: 'Administración de colaboradores y permisos' },
  { id: 8, nombre: 'Gestión de Roles', ruta: '/admin/roles', categoria: 'Administración', descripcion: 'Creación de roles y asignación de vistas' },
]

// Variables a nivel de módulo para deduplicación y caché
let fetchVistasPromise: Promise<VistaItem[]> | null = null
let lastLoadedRolId: any = '__initial__'
let lastLoadedColabId: any = '__initial__'

export const useVistasUsuario = () => {
  const supabase = useSupabaseClient()
  const { colaborador, esAdmin } = useAuthUser()

  const vistasAsignadas = useState<VistaItem[]>('usuario_vistas_asignadas', () => [])
  const catalogoCompletoVistas = useState<VistaItem[]>('catalogo_completo_vistas', () => [])
  const cargandoVistas = useState<boolean>('usuario_vistas_cargando', () => false)

  const rolActualNombre = computed(() => {
    if (colaborador.value?.roles?.rol) return colaborador.value.roles.rol
    if (Array.isArray(colaborador.value?.roles) && colaborador.value.roles.length > 0) {
      return colaborador.value.roles[0].rol
    }
    if (esAdmin.value) return 'ADMIN'
    return 'Colaborador'
  })

  // Obtener icono apropiado para cada vista
  const getVistaIcon = (ruta: string = '', nombre: string = '') => {
    const r = (ruta || '').toLowerCase()
    const n = (nombre || '').toLowerCase()

    if (r.includes('auditoria') || n.includes('auditoria')) return ShieldCheck
    if (r.includes('reporte') || n.includes('reporte') || r.includes('metricas') || n.includes('metrica')) return BarChart3
    if (r.includes('usuario') || n.includes('usuario')) return Users
    if (r.includes('rol') || n.includes('rol')) return ShieldCheck
    if (r.includes('proyecto') || n.includes('proyecto')) return FolderKanban
    if (r.includes('checklist') || n.includes('checklist')) return CheckSquare
    if (r === '/' || n.includes('calendario') || n.includes('tarea')) return CalendarDays
    if (r === '/admin' || r.includes('dashboard') || n.includes('dashboard') || n.includes('panel') || n.includes('inicio')) return LayoutDashboard
    return Layers
  }

  // Cargar vistas desde Supabase de forma optimizada con deduplicación y fusión completa
  const fetchVistas = async (force = false): Promise<VistaItem[]> => {
    const currentRolId = colaborador.value?.rol_id
    const currentColabId = colaborador.value?.id

    // 1. Si ya hay una consulta en curso, reutilizar la misma promesa
    if (!force && fetchVistasPromise) {
      return fetchVistasPromise
    }

    // 2. Si ya están cargadas en memoria para el mismo rol y colaborador, no volver a consultar
    if (
      !force && 
      vistasAsignadas.value.length > 0 && 
      lastLoadedRolId === currentRolId && 
      lastLoadedColabId === currentColabId
    ) {
      return vistasAsignadas.value
    }

    // 3. Solo activar indicador de carga si no hay datos previos para evitar parpadeos
    if (vistasAsignadas.value.length === 0) {
      cargandoVistas.value = true
    }

    fetchVistasPromise = (async () => {
      try {
        // Consultas en paralelo para mayor velocidad
        const [vistasRes, rolVistasRes] = await Promise.all([
          supabase.from('vistas').select('*').order('id', { ascending: true }),
          currentRolId && !esAdmin.value 
            ? supabase.from('rol_vistas').select('vista_id').eq('rol_id', currentRolId)
            : Promise.resolve({ data: null, error: null } as any)
        ])

        const dbVistas = vistasRes.data || []
        
        // Fusionar vistas de Supabase con DEFAULT_VISTAS para garantizar que NINGUNA vista del sistema falte
        const vistasMap = new Map<string, VistaItem>()
        DEFAULT_VISTAS.forEach(v => vistasMap.set(v.ruta, { ...v }))
        dbVistas.forEach((v: any) => {
          const defaultItem = vistasMap.get(v.ruta) || {}
          vistasMap.set(v.ruta, { ...defaultItem, ...v })
        })

        const catalogo = Array.from(vistasMap.values())
        catalogoCompletoVistas.value = catalogo

        // Si es ADMIN, tiene acceso completo a TODO el catálogo del sistema
        if (esAdmin.value) {
          vistasAsignadas.value = catalogo
        } else if (currentRolId && rolVistasRes.data && rolVistasRes.data.length > 0) {
          // Si tiene asignaciones en la BD
          const assignedIds = new Set(rolVistasRes.data.map((rv: any) => rv.vista_id))
          vistasAsignadas.value = catalogo.filter((v: any) => assignedIds.has(v.id))
        } else {
          // Fallback seguro de operaciones básicas
          vistasAsignadas.value = catalogo.filter((v: any) => 
            v.ruta === '/' || v.ruta === '/admin' || v.categoria === 'Operaciones'
          )
        }

        lastLoadedRolId = currentRolId
        lastLoadedColabId = currentColabId
        return vistasAsignadas.value
      } catch (err) {
        console.error('Error al cargar vistas del usuario:', err)
        vistasAsignadas.value = DEFAULT_VISTAS.filter(v => v.categoria !== 'Administración' || esAdmin.value)
        return vistasAsignadas.value
      } finally {
        cargandoVistas.value = false
        fetchVistasPromise = null
      }
    })()

    return fetchVistasPromise
  }

  // Inicializar carga si aún no se han cargado las vistas o si cambió el rol
  const currentRol = colaborador.value?.rol_id
  const currentColab = colaborador.value?.id
  if (vistasAsignadas.value.length === 0 || lastLoadedRolId !== currentRol || lastLoadedColabId !== currentColab) {
    fetchVistas()
  }

  // Agrupar vistas asignadas por categoría
  const vistasPorCategoria = computed(() => {
    const grupos: Record<string, VistaItem[]> = {}
    for (const v of vistasAsignadas.value) {
      const cat = v.categoria || 'General'
      if (!grupos[cat]) {
        grupos[cat] = []
      }
      grupos[cat].push(v)
    }
    return grupos
  })

  // Lista de categorías únicas
  const categoriasDisponibles = computed(() => {
    return Object.keys(vistasPorCategoria.value)
  })

  // Helper para validar si el usuario tiene acceso a una ruta o vista
  const tieneAcceso = (rutaOIdentificador: string): boolean => {
    if (esAdmin.value) return true
    if (!rutaOIdentificador) return false

    // Normalizar ruta
    const cleanTarget = rutaOIdentificador.split('?')[0].replace(/\/+$/, '') || '/'

    // La ruta del panel general (/admin) siempre es accesible para cualquier usuario con sesión
    if (cleanTarget === '/admin' || cleanTarget === '/') return true

    return vistasAsignadas.value.some((v) => {
      const cleanRuta = (v.ruta || '').split('?')[0].replace(/\/+$/, '') || '/'
      if (cleanRuta === cleanTarget) return true

      // Coincidencias por aliases comunes
      if (cleanTarget === '/reportes' && cleanRuta === '/admin/reportes') return true
      if (cleanTarget === '/admin/reportes' && cleanRuta === '/reportes') return true
      if (cleanTarget === '/auditoria' && cleanRuta === '/admin/auditoria') return true
      if (cleanTarget === '/admin/auditoria' && cleanRuta === '/auditoria') return true
      if (cleanTarget === '/proyectos' && cleanRuta === '/admin/proyectos') return true
      if (cleanTarget === '/admin/proyectos' && cleanRuta === '/proyectos') return true
      if (cleanTarget.startsWith('/proyectos/') && (cleanRuta === '/proyectos' || cleanRuta === '/admin/proyectos')) return true

      return false
    })
  }

  return {
    vistasAsignadas,
    catalogoCompletoVistas,
    cargandoVistas,
    rolActualNombre,
    vistasPorCategoria,
    categoriasDisponibles,
    tieneAcceso,
    getVistaIcon,
    fetchVistas
  }
}
