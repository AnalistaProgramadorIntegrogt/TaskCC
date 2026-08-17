<script setup lang="ts">
import { CircleCheck, ExternalLink, PlusCircle, CheckCircle2, FolderKanban, Layers } from 'lucide-vue-next'
import AdminGruposPredeterminados from '~/components/admin/AdminGruposPredeterminados.vue'

const supabase = useSupabaseClient()
const proyectos = ref([])
const cargando = ref(false)
const tabActiva = ref('proyectos') // 'proyectos' | 'grupos_default'

const nuevoProyecto = ref({
  nombre: '',
  descripcion: '',
})

const modalRef = ref(null)

const highlights = [
  { id: 1, feature: "Listas de verificación centralizadas" },
  { id: 2, feature: "Asignación de colaboradores" },
  { id: 3, feature: "Monitoreo en tiempo real" },
]

async function cargarProyectos() {
  cargando.value = true
  try {
    const { data } = await supabase
      .from('proyectos')
      .select('*')
      .order('created_at', { ascending: false })
    proyectos.value = data || []
  } finally {
    cargando.value = false
  }
}

function abrirModal() {
  if (modalRef.value) {
    modalRef.value.showModal()
  }
}

function cerrarModal() {
  if (modalRef.value) {
    modalRef.value.close()
  }
  nuevoProyecto.value.nombre = ''
  nuevoProyecto.value.descripcion = ''
}

async function guardarProyecto() {
  if (!nuevoProyecto.value.nombre) return

  const { error } = await supabase
    .from('proyectos')
    .insert({
      nombre: nuevoProyecto.value.nombre,
      descripcion: nuevoProyecto.value.descripcion,
    })

  if (!error) {
    cerrarModal()
    await cargarProyectos()
  }
}

async function desactivarProyecto(id: number) {
  await supabase.from('proyectos').update({ activo: false }).eq('id', id)
  await cargarProyectos()
}

onMounted(() => {
  cargarProyectos()
})

definePageMeta({
  middleware: ['admin'],
})
</script>

<template>
  <div class="p-6 mx-auto max-w-7xl space-y-6">
    <!-- Navegación por Pestañas -->
    <div class="flex border-b border-base-300 gap-2">
      <button 
        class="btn btn-ghost rounded-b-none border-b-2 gap-2 text-sm font-bold" 
        :class="tabActiva === 'proyectos' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-base-content/60'"
        @click="tabActiva = 'proyectos'"
      >
        <FolderKanban :size="18" />
        Gestión de Proyectos
      </button>
      <button 
        class="btn btn-ghost rounded-b-none border-b-2 gap-2 text-sm font-bold" 
        :class="tabActiva === 'grupos_default' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-base-content/60'"
        @click="tabActiva = 'grupos_default'"
      >
        <Layers :size="18" />
        Grupos Por Defecto Globales
      </button>
    </div>

    <!-- Pestaña 1: Gestión de Proyectos -->
    <div v-if="tabActiva === 'proyectos'" class="space-y-6">
      <!-- Header con botón Crear -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button @click="abrirModal" class="btn btn-primary gap-2 shadow-md">
            <PlusCircle :size="18" />
            Crear nuevo proyecto
          </button>
        </div>
        <div class="text-left md:text-right w-full md:w-auto">
          <h1 class="text-2xl font-bold text-base-content">Administra proyectos:</h1>
          <p class="text-sm text-base-content/60">Gestiona y revisa el progreso de tus espacios de trabajo.</p>
        </div>
      </div>
    
    <!-- Lista de proyectos (Grid) -->
    <div class="space-y-4">
      <div v-if="cargando" class="flex justify-center p-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
      
      <div v-else-if="proyectos.length === 0" class="alert bg-base-200 border border-base-300">
        <div class="flex items-center gap-3">
          <CheckCircle2 class="text-base-content/50" />
          <span>No hay proyectos creados aún. ¡Empieza creando uno nuevo!</span>
        </div>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="proyecto in proyectos" :key="proyecto.id" class="bg-base-100 rounded-xl p-6 shadow-sm border border-base-200 flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/30">
          <div>
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-lg font-bold text-base-content leading-tight">{{ proyecto.nombre }}</h3>
              <span v-if="!proyecto.activo" class="badge badge-error badge-sm">Inactivo</span>
              <span v-else class="badge badge-success badge-sm badge-outline">Activo</span>
            </div>
            <p class="text-base-content/60 text-sm mt-1 line-clamp-3">{{ proyecto.descripcion || 'Sin descripción.' }}</p>
          </div>
          
          <div class="mt-6 pt-4 border-t border-base-200 flex items-center justify-between">
            <NuxtLink :to="`/proyectos/${proyecto.id}`" class="btn btn-sm btn-ghost text-primary hover:bg-primary/10 px-2">
              Ver Checklist
              <ExternalLink :size="14" class="ml-1" />
            </NuxtLink>
            
            <button v-if="proyecto.activo" @click="desactivarProyecto(proyecto.id)" class="btn btn-xs btn-outline btn-error opacity-50 hover:opacity-100 transition-opacity">
              Desactivar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form (Basado en el diseño WorkspaceForm) -->
    <dialog ref="modalRef" class="modal modal-bottom sm:modal-middle">
      <div class="modal-box max-w-4xl bg-base-100 p-0 overflow-hidden shadow-2xl border border-base-300">
        <div class="flex items-center justify-center p-6 sm:p-10">
          <form @submit.prevent="guardarProyecto" class="w-full">
            <h3 class="text-xl font-semibold text-base-content mb-6">
              Crear nuevo espacio de trabajo
            </h3>
            
            <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <!-- Columna del Formulario -->
              <div class="lg:col-span-7">
                <div class="space-y-6">
                  <div>
                    <label for="workspace" class="block font-medium text-base-content text-sm mb-2">
                      Nombre del proyecto <span class="text-error">*</span>
                    </label>
                    <input 
                      id="workspace" 
                      v-model="nuevoProyecto.nombre" 
                      type="text" 
                      placeholder="Ej. Diseño UI/UX Rediseño"
                      class="input input-bordered w-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label for="desc" class="block font-medium text-base-content text-sm mb-2">
                      Descripción
                    </label>
                    <textarea 
                      id="desc" 
                      v-model="nuevoProyecto.descripcion" 
                      placeholder="Describe brevemente el objetivo del proyecto..."
                      class="textarea textarea-bordered w-full h-32 bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              <!-- Columna de Highlights -->
              <div class="lg:col-span-5">
                <div class="card bg-base-200/50 border border-base-200 shadow-sm">
                  <div class="card-body p-6">
                    <h4 class="text-sm font-semibold text-base-content">
                      Configura el entorno perfecto para tu equipo
                    </h4>
                    <p class="mt-2 text-sm leading-6 text-base-content/70">
                      Nuestros proyectos están diseñados para escalar con las necesidades de tu equipo. Todos los proyectos incluyen plantillas base y seguimiento global.
                    </p>
                    <ul class="mt-4 space-y-2">
                      <li v-for="item in highlights" :key="item.id" class="flex items-center space-x-2 text-base-content">
                        <CircleCheck class="h-5 w-5 text-primary shrink-0" />
                        <span class="truncate text-sm">{{ item.feature }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="divider my-8"></div>
            
            <div class="flex items-center justify-end space-x-3">
              <button type="button" @click="cerrarModal" class="btn btn-ghost">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary px-8">
                Crear Proyecto
              </button>
            </div>
          </form>
        </div>
        
        <!-- Botón cerrar (X) -->
        <button type="button" @click="cerrarModal" class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="cerrarModal">close</button>
      </form>
    </dialog>
    </div>

    <!-- Pestaña 2: Grupos Por Defecto Globales -->
    <div v-if="tabActiva === 'grupos_default'">
      <AdminGruposPredeterminados />
    </div>
  </div>
</template>
