<template>
  <section class="bg-base-200 py-6 md:py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
      
      <!-- Grilla de Tarjetas Destacadas Principales (Dinámica según Vistas Asignadas) -->
      <div 
        v-if="featuredCards.length > 0"
        class="grid gap-4 md:gap-6"
        :class="gridColsClass"
      >
        <NuxtLink 
          v-for="card in featuredCards" 
          :key="card.ruta"
          :to="card.ruta" 
          class="block rounded-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group p-6 md:p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
        >
          <div>
            <span class="badge badge-sm font-semibold" :class="card.badgeClass">
              {{ card.categoria }}
            </span>
            <p class="mt-2 text-xl md:text-2xl font-bold tracking-tight">{{ card.titulo }}</p>
            <p class="text-base-content/70 mt-2 text-sm">{{ card.descripcion }}</p>
          </div>

          <div class="py-8 flex items-center justify-center">
            <div class="relative group-hover:scale-105 transition-transform duration-300">
              <div 
                class="absolute -inset-2 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity"
                :class="card.glowClass"
              ></div>
              <div 
                class="bg-base-200/90 relative flex aspect-square size-20 items-center justify-center rounded-2xl border border-base-300/80 shadow-md transition-colors"
                :class="card.borderHoverClass"
              >
                <component 
                  :is="card.icon" 
                  class="size-10 transition-colors"
                  :class="card.iconClass"
                />
              </div>
            </div>
          </div>

          <div 
            class="flex items-center justify-between text-xs font-semibold pt-2 border-t border-base-200 transition-colors"
            :class="card.linkClass"
          >
            <span>{{ card.accion }}</span>
            <ArrowUpRight class="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </NuxtLink>
      </div>

      <!-- Card Directorio Dinámico de Vistas Asignadas -->
      <div 
        class="rounded-2xl border border-base-300/80 bg-base-100 text-base-content shadow-sm group relative flex flex-col overflow-hidden"
      >
        <!-- Encabezado del Directorio -->
        <div class="p-6 md:p-8 pb-4 border-b border-base-200/80">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="badge badge-neutral badge-sm font-semibold flex items-center gap-1">
                  <Compass class="size-3" /> Directorio de Vistas
                </span>
                <span v-if="!cargandoVistas" class="badge badge-primary badge-sm font-bold">
                  {{ vistasAsignadas.length }} {{ vistasAsignadas.length === 1 ? 'vista disponible' : 'vistas disponibles' }}
                </span>
              </div>
              <h3 class="text-xl md:text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
                Módulos y Herramientas Accesibles
              </h3>
              <p class="text-base-content/70 text-xs sm:text-sm mt-1 max-w-xl">
                Directorio completo de todas las secciones a las que tienes acceso según tu rol actual: <strong class="text-primary uppercase">{{ rolActualNombre }}</strong>.
              </p>
            </div>

            <!-- Filtro de Búsqueda Rápida -->
            <div v-if="vistasAsignadas.length > 2" class="relative min-w-[180px] sm:w-64">
              <Search class="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Buscar vista o módulo..." 
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
          <div v-if="cargandoVistas" class="flex flex-col items-center justify-center py-12 text-base-content/60 gap-3">
            <span class="loading loading-spinner loading-md text-primary"></span>
            <p class="text-xs font-medium">Cargando directorio de vistas de tu rol...</p>
          </div>

          <!-- Estado Vacío -->
          <div v-else-if="filteredVistas.length === 0" class="text-center py-10 px-4 text-base-content/60">
            <div class="inline-flex p-3 rounded-full bg-base-200 mb-2">
              <Compass class="size-6 opacity-50" />
            </div>
            <p class="font-semibold text-sm">No se encontraron vistas</p>
            <p class="text-xs text-base-content/50 mt-1">
              {{ searchQuery ? 'No hay vistas que coincidan con la búsqueda.' : 'No tienes vistas asignadas para tu rol actual.' }}
            </p>
          </div>

          <!-- Grilla / Lista de Vistas Accesibles -->
          <div 
            v-else 
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1"
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
        <div class="px-6 py-3.5 bg-base-200/40 border-t border-base-200 text-xs text-base-content/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span class="flex items-center gap-1.5 text-[11px]">
            <Sparkles class="size-3 text-primary shrink-0" />
            <span>Haz clic en cualquier vista para ingresar directamente</span>
          </span>
          <span class="text-[11px] font-mono opacity-80">
            Rol de Acceso: <strong class="text-base-content uppercase">{{ rolActualNombre }}</strong>
          </span>
        </div>

      </div>
      
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
  BarChart3,
  CalendarDays
} from 'lucide-vue-next'
import { useVistasUsuario } from '~/composables/useVistasUsuario'

const { 
  vistasAsignadas, 
  cargandoVistas, 
  rolActualNombre, 
  tieneAcceso, 
  getVistaIcon 
} = useVistasUsuario()

const searchQuery = ref('')
const selectedCategory = ref('TODAS')

// Catálogo de configuraciones para tarjetas destacadas superiores
const ALL_FEATURED_CONFIGS = [
  {
    ruta: '/admin/usuarios',
    titulo: 'Gestionar Usuarios',
    categoria: 'Administración',
    descripcion: 'Administra usuarios, roles y permisos de acceso al sistema.',
    accion: 'Administrar usuarios y permisos',
    icon: Users,
    badgeClass: 'badge-primary',
    glowClass: 'bg-gradient-to-r from-primary/30 to-secondary/30',
    borderHoverClass: 'group-hover:border-primary/50',
    iconClass: 'text-primary group-hover:text-secondary',
    linkClass: 'text-primary group-hover:text-secondary',
  },
  {
    ruta: '/admin/proyectos',
    titulo: 'Gestionar Proyectos',
    categoria: 'Proyectos & Tareas',
    descripcion: 'Administra proyectos, tareas recurrentes, grupos predeterminados y logos.',
    accion: 'Configurar proyectos y tareas',
    icon: FolderKanban,
    badgeClass: 'badge-secondary',
    glowClass: 'bg-gradient-to-r from-secondary/30 to-accent/30',
    borderHoverClass: 'group-hover:border-secondary/50',
    iconClass: 'text-secondary group-hover:text-primary',
    linkClass: 'text-secondary group-hover:text-primary',
  },
  {
    ruta: '/admin/roles',
    titulo: 'Gestionar Roles',
    categoria: 'Seguridad',
    descripcion: 'Crea roles y asigna vistas y permisos para cada usuario o grupo.',
    accion: 'Configurar matriz de acceso',
    icon: ShieldCheck,
    badgeClass: 'badge-accent',
    glowClass: 'bg-gradient-to-r from-accent/30 to-primary/30',
    borderHoverClass: 'group-hover:border-accent/50',
    iconClass: 'text-accent group-hover:text-primary',
    linkClass: 'text-accent group-hover:text-primary',
  },
  {
    ruta: '/admin/auditoria',
    titulo: 'Auditoría de Tareas',
    categoria: 'Calidad & Operaciones',
    descripcion: 'Auditoría, revisión y calificación de tareas y checklists completados.',
    accion: 'Auditar tareas completadas',
    icon: ShieldCheck,
    badgeClass: 'badge-accent',
    glowClass: 'bg-gradient-to-r from-accent/30 to-info/30',
    borderHoverClass: 'group-hover:border-accent/50',
    iconClass: 'text-accent group-hover:text-info',
    linkClass: 'text-accent group-hover:text-info',
  },
  {
    ruta: '/admin/reportes',
    titulo: 'Reportería y Métricas',
    categoria: 'Métricas & Cumplimiento',
    descripcion: 'Seguimiento de cumplimiento, exportación a Excel e indicadores de rendimiento.',
    accion: 'Ver reportes y estadísticas',
    icon: BarChart3,
    badgeClass: 'badge-info',
    glowClass: 'bg-gradient-to-r from-info/30 to-primary/30',
    borderHoverClass: 'group-hover:border-info/50',
    iconClass: 'text-info group-hover:text-primary',
    linkClass: 'text-info group-hover:text-primary',
  },
  {
    ruta: '/',
    titulo: 'Mis Tareas y Calendario',
    categoria: 'Operaciones Diarias',
    descripcion: 'Calendario personal interactivo, control de tareas e incidencias en tiempo real.',
    accion: 'Ver mi calendario diario',
    icon: CalendarDays,
    badgeClass: 'badge-success',
    glowClass: 'bg-gradient-to-r from-success/30 to-primary/30',
    borderHoverClass: 'group-hover:border-success/50',
    iconClass: 'text-success group-hover:text-primary',
    linkClass: 'text-success group-hover:text-primary',
  },
]

// Filtrar las tarjetas destacadas que el usuario tiene permitidas
const featuredCards = computed(() => {
  // Filtrar las tarjetas a las que el usuario tiene acceso
  const accessible = ALL_FEATURED_CONFIGS.filter(c => tieneAcceso(c.ruta))
  
  // Limitar a máximo 3 tarjetas destacadas para mantener el equilibrio visual
  return accessible.slice(0, 3)
})

// Clase dinámica para columnas según la cantidad de tarjetas destacadas
const gridColsClass = computed(() => {
  const count = featuredCards.value.length
  if (count === 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-3'
})

// Categorías disponibles según las vistas asignadas
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

// Clases visuales de categorías
const getCategoryBadgeClass = (categoria?: string) => {
  switch ((categoria || '').toLowerCase()) {
    case 'administración':
    case 'administracion':
      return 'badge-primary badge-outline'
    case 'operaciones':
    case 'calidad & operaciones':
      return 'badge-success badge-outline'
    case 'general':
      return 'badge-info badge-outline'
    default:
      return 'badge-neutral badge-outline'
  }
}

const getCategoryIconBgClass = (categoria?: string) => {
  switch ((categoria || '').toLowerCase()) {
    case 'administración':
    case 'administracion':
      return 'bg-primary/10 text-primary border-primary/20'
    case 'operaciones':
    case 'calidad & operaciones':
      return 'bg-success/10 text-success border-success/20'
    case 'general':
      return 'bg-info/10 text-info border-info/20'
    default:
      return 'bg-neutral/10 text-neutral border-neutral/20'
  }
}
</script>
