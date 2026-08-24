<template>
  <section class="bg-base-200 py-8 md:py-16">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="mx-auto grid gap-3 sm:grid-cols-5">
        
        <!-- Card 1: Gestionar Usuarios -->
        <NuxtLink 
          to="/admin/usuarios" 
          class="block rounded-2xl sm:rounded-none sm:rounded-tl-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group overflow-hidden sm:col-span-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative"
        >
          <div class="flex flex-col space-y-1.5 p-6 md:p-8 relative z-20">
            <div class="flex items-center gap-2">
              <span class="badge badge-primary badge-sm font-semibold">Administración</span>
            </div>
            <div>
              <p class="font-bold text-xl md:text-2xl mt-1 tracking-tight">Gestionar Usuarios</p>
              <p class="text-base-content/70 mt-2 max-w-sm text-sm">Administra usuarios, roles y permisos de acceso al sistema.</p>
            </div>
          </div>
          <div class="relative h-fit pl-6 md:pl-12">
            <div class="absolute -inset-6 [background:radial-gradient(75%_95%_at_50%_0%,transparent,var(--fallback-b1,oklch(var(--b1))))] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="bg-base-100 overflow-hidden rounded-tl-xl border-l border-t border-base-200 pl-2 pt-2 relative z-10 shadow-inner">
              <img
                src="/img/images/USERS.png"
                class="shadow-md rounded-tl-lg"
                alt="Gestionar Usuarios"
                width="1207"
                height="929"
              />
            </div>
          </div>
        </NuxtLink>

        <!-- Card 2: Gestionar Proyectos -->
        <NuxtLink 
          to="/admin/proyectos" 
          class="block rounded-2xl sm:rounded-none sm:rounded-tr-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group overflow-hidden sm:col-span-2 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative"
        >
          <div class="p-6 md:p-8 pb-0">
            <span class="badge badge-secondary badge-sm font-semibold">Proyectos & Tareas</span>
            <p class="mt-2 text-xl md:text-2xl font-bold tracking-tight">Gestionar Proyectos</p>
            <p class="text-base-content/70 mt-2 text-sm">Administra proyectos, tareas recurrentes, grupos predeterminados y logos.</p>
          </div>
          <div class="p-6 pt-4 mt-auto h-fit">
            <div class="relative mb-2">
              <div class="absolute -inset-6 [background:radial-gradient(50%_75%_at_75%_50%,transparent,var(--fallback-b1,oklch(var(--b1))))] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="aspect-76/59 overflow-hidden rounded-xl border border-base-200 relative z-10 shadow-md">
                <img
                  src="https://tailark.com/_next/image?url=%2Forigin-cal.png&w=3840&q=75"
                  class="shadow object-cover w-full h-full"
                  alt="Gestionar Proyectos"
                  width="1207"
                  height="929"
                />
              </div>
            </div>
          </div>
        </NuxtLink>

        <!-- Card 3: Gestionar Roles -->
        <NuxtLink 
          to="/admin/roles" 
          class="block rounded-2xl sm:rounded-none sm:rounded-bl-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group p-6 md:p-8 sm:col-span-2 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
        >
          <div>
            <span class="badge badge-accent badge-sm font-semibold">Seguridad</span>
            <p class="mt-2 text-xl md:text-2xl font-bold tracking-tight">Gestionar Roles</p>
            <p class="text-base-content/70 mt-2 text-sm">Crea roles y asigna vistas y permisos para cada usuario o grupo.</p>
          </div>

          <div class="py-6 flex items-center justify-center">
            <div class="relative group-hover:scale-105 transition-transform duration-300">
              <div class="absolute -inset-2 bg-gradient-to-r from-accent/30 to-primary/30 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <div class="bg-base-200/90 relative flex aspect-square size-20 items-center justify-center rounded-2xl border border-base-300/80 shadow-md group-hover:border-accent/50 transition-colors">
                <ShieldCheck class="size-10 text-accent group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs font-semibold text-accent group-hover:text-primary transition-colors pt-2 border-t border-base-200">
            <span>Configurar matriz de acceso</span>
            <ArrowUpRight class="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </NuxtLink>

        <!-- Card 4: Otras Vistas (Directorio Dinámico de Vistas Asignadas) -->
        <div 
          class="rounded-2xl sm:rounded-none sm:rounded-br-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group relative sm:col-span-3 flex flex-col overflow-hidden"
        >
          <!-- Encabezado del Directorio -->
          <div class="p-6 md:p-8 pb-4 border-b border-base-200/80">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="badge badge-neutral badge-sm font-semibold flex items-center gap-1">
                    <Compass class="size-3" /> Directorio
                  </span>
                  <span v-if="!loading" class="badge badge-primary badge-sm font-bold">
                    {{ vistasAsignadas.length }} {{ vistasAsignadas.length === 1 ? 'vista' : 'vistas' }}
                  </span>
                </div>
                <h3 class="text-xl md:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
                  Otras Vistas
                </h3>
                <p class="text-base-content/70 text-xs sm:text-sm mt-1 max-w-lg">
                  Directorio interactivo de todas las vistas a las que tienes acceso según tu rol actual.
                </p>
              </div>

              <!-- Filtro de Búsqueda Rápida -->
              <div v-if="vistasAsignadas.length > 3" class="relative min-w-[180px] sm:w-56">
                <Search class="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Buscar vista..." 
                  class="input input-bordered input-sm w-full pl-9 pr-3 text-xs rounded-lg focus:input-primary"
                />
              </div>
            </div>

            <!-- Filtros por Categoría (Pills) -->
            <div v-if="categories.length > 1" class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-base-200/60">
              <button 
                v-for="cat in categories" 
                :key="cat"
                @click="selectedCategory = cat"
                class="btn btn-xs rounded-md transition-all font-medium"
                :class="selectedCategory === cat ? 'btn-neutral shadow-xs' : 'btn-ghost text-base-content/70 hover:bg-base-200'"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Contenido del Directorio (Vistas) -->
          <div class="p-4 sm:p-6 flex-grow flex flex-col justify-center">
            <!-- Estado de Carga -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-12 text-base-content/60 gap-3">
              <span class="loading loading-spinner loading-md text-primary"></span>
              <p class="text-xs font-medium">Cargando directorio de vistas...</p>
            </div>

            <!-- Estado Vacío -->
            <div v-else-if="filteredVistas.length === 0" class="text-center py-10 px-4 text-base-content/60">
              <div class="inline-flex p-3 rounded-full bg-base-200 mb-2">
                <Compass class="size-6 opacity-50" />
              </div>
              <p class="font-semibold text-sm">No se encontraron vistas</p>
              <p class="text-xs text-base-content/50 mt-1">
                {{ searchQuery ? 'No hay vistas que coincidan con la búsqueda.' : 'No hay vistas asignadas a tu rol.' }}
              </p>
            </div>

            <!-- Grilla / Lista de Vistas Accesibles -->
            <div 
              v-else 
              class="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1"
            >
              <NuxtLink 
                v-for="vista in filteredVistas" 
                :key="vista.id || vista.ruta"
                :to="vista.ruta"
                class="flex items-start gap-3 p-3 rounded-xl border border-base-200/80 bg-base-200/30 hover:bg-base-100 hover:border-primary/40 hover:shadow-md transition-all duration-200 group/item cursor-pointer relative overflow-hidden"
              >
                <!-- Icono de la Vista -->
                <div 
                  class="size-9 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs group-hover/item:scale-105"
                  :class="getCategoryIconBgClass(vista.categoria)"
                >
                  <component :is="getVistaIcon(vista.ruta, vista.nombre)" class="size-4.5" />
                </div>

                <!-- Info de la Vista -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-xs sm:text-sm text-base-content truncate group-hover/item:text-primary transition-colors">
                      {{ vista.nombre }}
                    </span>
                    <ArrowUpRight class="size-3.5 shrink-0 opacity-40 group-hover/item:opacity-100 group-hover/item:text-primary group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all" />
                  </div>

                  <p class="text-[11px] text-base-content/70 line-clamp-2 mt-0.5 leading-snug">
                    {{ vista.descripcion || 'Acceso directo a esta sección' }}
                  </p>

                  <div class="mt-1.5 flex items-center gap-1.5">
                    <span 
                      class="badge badge-xs font-medium"
                      :class="getCategoryBadgeClass(vista.categoria)"
                    >
                      {{ vista.categoria || 'General' }}
                    </span>
                    <span class="text-[10px] text-base-content/40 font-mono truncate">
                      {{ vista.ruta }}
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Pie del Card -->
          <div class="px-6 py-3 bg-base-200/40 border-t border-base-200 text-xs text-base-content/60 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-[11px]">
              <Sparkles class="size-3 text-primary" />
              <span>Haz clic en cualquier vista para ingresar directamente</span>
            </span>
            <span class="text-[11px] font-mono opacity-60">
              Rol: {{ rolActualNombre }}
            </span>
          </div>

        </div>
        
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { 
  Users, 
  ShieldCheck, 
  FolderKanban, 
  CheckSquare, 
  LayoutDashboard, 
  Layers, 
  Compass, 
  Search, 
  ArrowUpRight, 
  Sparkles,
  BarChart3
} from 'lucide-vue-next'

const supabase = useSupabaseClient()
const { colaborador } = useAuthUser()

const loading = ref(true)
const vistasAsignadas = ref<any[]>([])
const searchQuery = ref('')
const selectedCategory = ref('TODAS')

// Catálogo por defecto de Vistas (fallback)
const DEFAULT_VISTAS = [
  { id: 1, nombre: 'Inicio / Dashboard', ruta: '/admin', categoria: 'General', descripcion: 'Vista principal con accesos y estado' },
  { id: 2, nombre: 'Checklists Diarios', ruta: '/checklists', categoria: 'Operaciones', descripcion: 'Formulario y seguimiento de checklists diarios' },
  { id: 3, nombre: 'Proyectos', ruta: '/proyectos', categoria: 'Operaciones', descripcion: 'Listado e información detallada de proyectos' },
  { id: 4, nombre: 'Auditoría de Tareas', ruta: '/admin/auditoria', categoria: 'Operaciones', descripcion: 'Auditoría, revisión y calificación de tareas completadas' },
  { id: 5, nombre: 'Reportería y Métricas', ruta: '/admin/reportes', categoria: 'Operaciones', descripcion: 'Seguimiento, asignaciones y cumplimiento de checklists' },
  { id: 6, nombre: 'Gestión de Usuarios', ruta: '/admin/usuarios', categoria: 'Administración', descripcion: 'Administración de colaboradores y permisos' },
  { id: 7, nombre: 'Gestión de Proyectos', ruta: '/admin/proyectos', categoria: 'Administración', descripcion: 'Configuración de proyectos y tareas' },
  { id: 8, nombre: 'Gestión de Roles', ruta: '/admin/roles', categoria: 'Administración', descripcion: 'Creación de roles y asignación de vistas' },
]

const rolActualNombre = computed(() => {
  if (colaborador.value?.roles?.rol) return colaborador.value.roles.rol
  if (Array.isArray(colaborador.value?.roles) && colaborador.value.roles.length > 0) {
    return colaborador.value.roles[0].rol
  }
  if (colaborador.value?.rol_id === 2) return 'ADMIN'
  return 'Usuario'
})

const fetchVistas = async () => {
  loading.value = true
  try {
    // 1. Obtener todas las vistas del catálogo
    const { data: allVistas, error: vErr } = await supabase
      .from('vistas')
      .select('*')
      .order('id', { ascending: true })

    const baseVistas = (allVistas && allVistas.length > 0) ? allVistas : DEFAULT_VISTAS

    // Verificar si es ADMIN (rol_id === 2 o rol === 'ADMIN')
    const isUserAdmin = 
      colaborador.value?.roles?.rol === 'ADMIN' || 
      (Array.isArray(colaborador.value?.roles) && colaborador.value.roles.some((r: any) => r.rol === 'ADMIN')) ||
      colaborador.value?.rol_id === 2

    if (isUserAdmin) {
      // Si es admin, tiene acceso a todas las vistas registradas
      vistasAsignadas.value = baseVistas
    } else if (colaborador.value?.rol_id) {
      // Si tiene rol asignado, consultar la tabla de relación rol_vistas
      const { data: rolVistas, error: rvErr } = await supabase
        .from('rol_vistas')
        .select('vista_id')
        .eq('rol_id', colaborador.value.rol_id)

      if (rolVistas && rolVistas.length > 0) {
        const assignedIds = rolVistas.map((rv: any) => rv.vista_id)
        vistasAsignadas.value = baseVistas.filter((v: any) => assignedIds.includes(v.id))
      } else {
        vistasAsignadas.value = baseVistas
      }
    } else {
      vistasAsignadas.value = baseVistas
    }
  } catch (e) {
    console.error('Error fetching vistas for dashboard:', e)
    vistasAsignadas.value = DEFAULT_VISTAS
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVistas()
})

watch(colaborador, () => {
  fetchVistas()
})

// Categorías disponibles
const categories = computed(() => {
  const cats = new Set<string>()
  vistasAsignadas.value.forEach(v => {
    if (v.categoria) cats.add(v.categoria)
  })
  if (cats.size <= 1) return []
  return ['TODAS', ...Array.from(cats)]
})

// Vistas filtradas por búsqueda y categoría
const filteredVistas = computed(() => {
  let list = vistasAsignadas.value

  if (selectedCategory.value !== 'TODAS') {
    list = list.filter(v => (v.categoria || 'General') === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(v => 
      v.nombre?.toLowerCase().includes(q) || 
      v.descripcion?.toLowerCase().includes(q) ||
      v.ruta?.toLowerCase().includes(q)
    )
  }

  return list
})

// Helpers visuales
const getVistaIcon = (ruta: string, nombre: string) => {
  const r = (ruta || '').toLowerCase()
  const n = (nombre || '').toLowerCase()
  if (r.includes('auditoria') || n.includes('auditoria')) return ShieldCheck
  if (r.includes('reporte') || n.includes('reporte') || r.includes('metricas') || n.includes('metrica')) return BarChart3
  if (r.includes('usuario') || n.includes('usuario')) return Users
  if (r.includes('rol') || n.includes('rol')) return ShieldCheck
  if (r.includes('checklist') || n.includes('checklist')) return CheckSquare
  if (r.includes('proyecto') || n.includes('proyecto')) return FolderKanban
  if (r === '/' || r === '/admin' || r.includes('dashboard') || n.includes('dashboard') || n.includes('inicio')) return LayoutDashboard
  return Layers
}

const getCategoryBadgeClass = (categoria: string) => {
  switch ((categoria || '').toLowerCase()) {
    case 'administración':
    case 'administracion':
      return 'badge-primary badge-outline'
    case 'operaciones':
      return 'badge-success badge-outline'
    case 'general':
      return 'badge-info badge-outline'
    default:
      return 'badge-neutral badge-outline'
  }
}

const getCategoryIconBgClass = (categoria: string) => {
  switch ((categoria || '').toLowerCase()) {
    case 'administración':
    case 'administracion':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'operaciones':
      return 'bg-success/10 text-success border-success/20'
    case 'general':
      return 'bg-info/10 text-info border-info/20'
    default:
      return 'bg-neutral/10 text-neutral border-neutral/20'
  }
}
</script>
