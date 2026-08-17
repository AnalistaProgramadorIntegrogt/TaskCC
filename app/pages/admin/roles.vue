<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-base-content flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Gestión de Roles y Vistas
        </h1>
        <p class="text-base-content/70 mt-1 text-sm">
          Crea roles, configura sus descripciones y asigna las vistas a las que tienen acceso.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn btn-ghost btn-sm md:btn-md gap-2" @click="fetchData" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="{'animate-spin': loading}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
        <button class="btn btn-primary gap-2 shadow-md" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>
    </div>

    <!-- Alert si faltan las tablas en Supabase -->
    <div v-if="missingTablesWarning" class="alert alert-warning shadow-lg border border-warning/30">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <h3 class="font-bold text-sm">Aviso de configuración de Base de Datos</h3>
        <div class="text-xs">
          La tabla <code class="font-mono font-semibold">public.vistas</code> o <code class="font-mono font-semibold">public.rol_vistas</code> aún no se ha creado en Supabase. Ejecuta el archivo <code class="font-mono bg-warning-content/10 px-1 rounded">sql/006_roles_vistas.sql</code> en tu proyecto para habilitar la sincronización completa. Se está utilizando el catálogo local por defecto.
        </div>
      </div>
    </div>

    <!-- Toast de Notificación -->
    <div v-if="toastMessage" class="toast toast-end toast-bottom z-50">
      <div class="alert" :class="toastType === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <!-- KPI / Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="stat-title text-xs font-semibold uppercase tracking-wider">Total Roles</div>
        <div class="stat-value text-2xl md:text-3xl text-primary">{{ roles.length }}</div>
        <div class="stat-desc text-xs">Roles definidos en el sistema</div>
      </div>

      <div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">
        <div class="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div class="stat-title text-xs font-semibold uppercase tracking-wider">Vistas Registradas</div>
        <div class="stat-value text-2xl md:text-3xl text-secondary">{{ vistasList.length }}</div>
        <div class="stat-desc text-xs">Vistas de la aplicación</div>
      </div>

      <div class="stat bg-base-100 rounded-xl shadow-sm border border-base-200">
        <div class="stat-figure text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="stat-title text-xs font-semibold uppercase tracking-wider">Colaboradores Asignados</div>
        <div class="stat-value text-2xl md:text-3xl text-accent">{{ totalColaboradoresAsignados }}</div>
        <div class="stat-desc text-xs">Usuarios con rol configurado</div>
      </div>
    </div>

    <!-- Barra de búsqueda y Filtros -->
    <div class="bg-base-100 p-4 rounded-xl shadow-sm border border-base-200 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="relative w-full sm:w-80">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar por nombre o descripción..." 
          class="input input-bordered w-full pl-10 focus:input-primary text-sm"
        />
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div class="text-xs text-base-content/60">
        Mostrando {{ filteredRoles.length }} de {{ roles.length }} roles
      </div>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="loading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Tabla de Roles -->
    <div v-else class="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      <div v-if="filteredRoles.length === 0" class="p-12 text-center text-base-content/60">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="font-semibold text-lg">No se encontraron roles</p>
        <p class="text-sm mt-1">Intenta con otro término de búsqueda o crea un nuevo rol.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="bg-base-200/70 text-base-content/80 text-xs uppercase tracking-wider">
              <th>ID</th>
              <th>Rol</th>
              <th>Descripción</th>
              <th>Vistas Asignadas</th>
              <th>Usuarios</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredRoles" :key="item.id" class="hover:bg-base-200/50 transition-colors">
              <td class="font-mono text-xs opacity-60">#{{ item.id }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="badge badge-lg font-bold shadow-xs" :class="getBadgeStyle(item.rol)">
                    {{ item.rol }}
                  </div>
                </div>
              </td>
              <td>
                <div class="text-sm max-w-xs text-base-content/80">
                  {{ item.descripcion || 'Sin descripción' }}
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1 max-w-md">
                  <template v-if="getVistasForRole(item.id).length > 0">
                    <span 
                      v-for="v in getVistasForRole(item.id).slice(0, 4)" 
                      :key="v.id" 
                      class="badge badge-sm bg-base-200 border-base-300 text-xs"
                    >
                      {{ v.nombre }}
                    </span>
                    <span 
                      v-if="getVistasForRole(item.id).length > 4" 
                      class="badge badge-sm badge-outline text-xs cursor-pointer hover:bg-base-200"
                      @click="openEditModal(item)"
                    >
                      +{{ getVistasForRole(item.id).length - 4 }} más
                    </span>
                  </template>
                  <span v-else class="text-xs italic text-base-content/40">Sin vistas asignadas</span>
                </div>
              </td>
              <td>
                <div class="flex items-center gap-1.5 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="font-semibold">{{ getColaboradoresCount(item.id) }}</span>
                </div>
              </td>
              <td class="text-right">
                <div class="flex justify-end items-center gap-1">
                  <button class="btn btn-ghost btn-xs sm:btn-sm text-info" @click="openEditModal(item)" title="Editar Rol">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button 
                    class="btn btn-ghost btn-xs sm:btn-sm text-error" 
                    @click="openDeleteModal(item)"
                    title="Eliminar Rol"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear / Editar Rol -->
    <dialog id="role_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200 max-w-3xl">
        <h3 class="font-extrabold text-2xl mb-2 text-base-content flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {{ isEditing ? 'Editar Rol' : 'Crear Nuevo Rol' }}
        </h3>
        <p class="text-sm text-base-content/70 mb-6">
          Ingresa el nombre del rol, su descripción y selecciona las vistas a las que tendrá acceso.
        </p>

        <form @submit.prevent="saveRole" class="space-y-5">
          <!-- Datos básicos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold">Nombre del Rol <span class="text-error">*</span></span></label>
              <input 
                type="text" 
                v-model="roleForm.rol" 
                placeholder="Ej. SUPERVISOR, GERENTE..." 
                class="input input-bordered w-full uppercase focus:input-primary" 
                required
              />
            </div>

            <div class="form-control w-full">
              <label class="label"><span class="label-text font-bold">Descripción</span></label>
              <input 
                type="text" 
                v-model="roleForm.descripcion" 
                placeholder="Breve descripción del rol y sus responsabilidades" 
                class="input input-bordered w-full focus:input-primary" 
              />
            </div>
          </div>

          <div class="divider my-1 text-xs uppercase tracking-wider text-base-content/50 font-semibold">
            Vistas Asignadas (Permisos de Acceso)
          </div>

          <!-- Selección de Vistas -->
          <div class="space-y-4 max-h-72 overflow-y-auto pr-1">
            <div 
              v-for="(groupVistas, category) in vistasByCategory" 
              :key="category" 
              class="bg-base-200/60 rounded-xl p-4 border border-base-200 space-y-3"
            >
              <div class="flex justify-between items-center pb-2 border-b border-base-300">
                <span class="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {{ category }}
                </span>
                <button 
                  type="button" 
                  class="btn btn-ghost btn-xs text-xs font-normal hover:bg-base-300"
                  @click="toggleCategoryVistas(groupVistas)"
                >
                  {{ isCategoryAllSelected(groupVistas) ? 'Desmarcar todo' : 'Seleccionar todo' }}
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label 
                  v-for="vista in groupVistas" 
                  :key="vista.id" 
                  class="flex items-start gap-3 p-2 rounded-lg bg-base-100 hover:bg-base-200/80 cursor-pointer border border-base-200/60 transition-colors"
                >
                  <input 
                    type="checkbox" 
                    :value="vista.id" 
                    v-model="roleForm.selectedVistas" 
                    class="checkbox checkbox-sm checkbox-primary mt-1" 
                  />
                  <div>
                    <div class="font-bold text-sm text-base-content">{{ vista.nombre }}</div>
                    <div class="font-mono text-xs text-primary/80">{{ vista.ruta }}</div>
                    <div v-if="vista.descripcion" class="text-xs text-base-content/60 mt-0.5">{{ vista.descripcion }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Acciones del Modal -->
          <div class="modal-action mt-6 pt-4 border-t border-base-200 flex justify-between items-center">
            <span class="text-xs text-base-content/60">
              {{ roleForm.selectedVistas.length }} vistas seleccionadas
            </span>
            <div class="flex gap-3">
              <button type="button" class="btn btn-ghost" @click="closeRoleModal" :disabled="saving">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary min-w-[120px]" :disabled="saving">
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <span v-else>{{ isEditing ? 'Guardar Cambios' : 'Crear Rol' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <form method="dialog" class="modal-backdrop" @click="closeRoleModal">
        <button>close</button>
      </form>
    </dialog>

    <!-- Modal Eliminar Rol -->
    <dialog id="delete_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isDeleteModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200">
        <h3 class="font-extrabold text-xl text-error flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Confirmar Eliminación
        </h3>

        <div v-if="deletingRole">
          <p class="text-sm text-base-content/80 mb-4">
            ¿Estás seguro de que deseas eliminar el rol <strong class="text-base-content font-bold">{{ deletingRole.rol }}</strong>?
          </p>

          <div v-if="getColaboradoresCount(deletingRole.id) > 0" class="alert alert-error text-xs shadow-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <span class="font-bold">Acción Bloqueada:</span> Este rol tiene <strong>{{ getColaboradoresCount(deletingRole.id) }} colaboradores</strong> asignados. Debes reasignar a esos usuarios en Gestión de Usuarios antes de poder eliminar este rol.
            </div>
          </div>

          <div v-else class="text-xs text-base-content/60 bg-base-200 p-3 rounded-lg">
            Esta acción eliminará el rol y desasociará sus vistas asignadas. Esta acción no se puede deshacer.
          </div>
        </div>

        <div class="modal-action mt-6">
          <button class="btn btn-ghost" @click="closeDeleteModal" :disabled="deleting">Cancelar</button>
          <button 
            class="btn btn-error" 
            @click="confirmDeleteRole" 
            :disabled="deleting || (deletingRole && getColaboradoresCount(deletingRole.id) > 0)"
          >
            <span v-if="deleting" class="loading loading-spinner loading-sm"></span>
            Eliminar Rol
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeDeleteModal">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
})

const supabase = useSupabaseClient()

// Estados principales
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const missingTablesWarning = ref(false)

// Toast
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Catálogos
const roles = ref<any[]>([])
const vistasList = ref<any[]>([])
const rolVistasMap = ref<Record<number, number[]>>({}) // rol_id -> [vista_id, ...]
const colaboradores = ref<any[]>([])

// Modal Crear/Editar
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingRoleId = ref<number | null>(null)
const roleForm = ref({
  rol: '',
  descripcion: '',
  selectedVistas: [] as number[]
})

// Modal Eliminar
const isDeleteModalOpen = ref(false)
const deletingRole = ref<any>(null)

// Catálogo por defecto de Vistas (fallback si la tabla aún no existe en Supabase)
const DEFAULT_VISTAS = [
  { id: 1, nombre: 'Inicio / Dashboard', ruta: '/', categoria: 'General', descripcion: 'Vista principal con accesos y estado' },
  { id: 2, nombre: 'Checklists Diarios', ruta: '/checklists', categoria: 'Operaciones', descripcion: 'Formulario y seguimiento de checklists diarios' },
  { id: 3, nombre: 'Proyectos', ruta: '/proyectos', categoria: 'Operaciones', descripcion: 'Listado e información detallada de proyectos' },
  { id: 4, nombre: 'Gestión de Usuarios', ruta: '/admin/usuarios', categoria: 'Administración', descripcion: 'Administración de colaboradores y permisos' },
  { id: 5, nombre: 'Gestión de Proyectos', ruta: '/admin/proyectos', categoria: 'Administración', descripcion: 'Configuración de proyectos y tareas' },
  { id: 6, nombre: 'Gestión de Roles', ruta: '/admin/roles', categoria: 'Administración', descripcion: 'Creación de roles y asignación de vistas' },
]

onMounted(async () => {
  await fetchData()
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

const fetchData = async () => {
  loading.value = true
  missingTablesWarning.value = false
  try {
    // 1. Cargar Roles
    const { data: rolesData, error: rolesErr } = await supabase
      .from('roles')
      .select('*')
      .order('id', { ascending: true })

    if (rolesErr) throw rolesErr
    roles.value = rolesData || []

    // 2. Cargar Colaboradores para contabilizar usuarios por rol
    const { data: colabsData } = await supabase
      .from('colaboradores')
      .select('id, rol_id')

    colaboradores.value = colabsData || []

    // 3. Cargar Vistas
    const { data: vistasData, error: vistasErr } = await supabase
      .from('vistas')
      .select('*')
      .order('categoria', { ascending: true })

    if (vistasErr) {
      console.warn('Tabla vistas no encontrada en Supabase, utilizando catálogo local por defecto:', vistasErr.message)
      vistasList.value = DEFAULT_VISTAS
      missingTablesWarning.value = true
    } else if (vistasData && vistasData.length > 0) {
      vistasList.value = vistasData
    } else {
      vistasList.value = DEFAULT_VISTAS
    }

    // 4. Cargar Relación Rol - Vistas
    const { data: rvData, error: rvErr } = await supabase
      .from('rol_vistas')
      .select('*')

    if (rvErr) {
      console.warn('Tabla rol_vistas no encontrada:', rvErr.message)
      missingTablesWarning.value = true
      // Generar asignaciones por defecto visuales (ej. ADMIN tiene todas)
      const map: Record<number, number[]> = {}
      const adminRole = roles.value.find(r => r.rol.toUpperCase() === 'ADMIN')
      if (adminRole) {
        map[adminRole.id] = vistasList.value.map(v => v.id)
      }
      rolVistasMap.value = map
    } else {
      const map: Record<number, number[]> = {}
      rvData?.forEach((row: any) => {
        if (!map[row.rol_id]) map[row.rol_id] = []
        map[row.rol_id].push(row.vista_id)
      })
      rolVistasMap.value = map
    }
  } catch (err: any) {
    console.error('Error fetching roles data:', err)
    showToast('Error al cargar la información de roles', 'error')
  } finally {
    loading.value = false
  }
}

// Computed
const filteredRoles = computed(() => {
  if (!searchQuery.value.trim()) return roles.value
  const q = searchQuery.value.toLowerCase()
  return roles.value.filter(r => 
    r.rol?.toLowerCase().includes(q) || 
    r.descripcion?.toLowerCase().includes(q)
  )
})

const totalColaboradoresAsignados = computed(() => {
  return colaboradores.value.filter(c => c.rol_id !== null).length
})

const vistasByCategory = computed(() => {
  const groups: Record<string, any[]> = {}
  vistasList.value.forEach(v => {
    const cat = v.categoria || 'General'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(v)
  })
  return groups
})

// Helpers
const getBadgeStyle = (rolName: string) => {
  switch (rolName?.toUpperCase()) {
    case 'ADMIN': return 'badge-error text-error-content'
    case 'USER': return 'badge-info text-info-content'
    case 'SUPERVISOR': return 'badge-accent text-accent-content'
    default: return 'badge-neutral text-neutral-content'
  }
}

const getColaboradoresCount = (roleId: number) => {
  return colaboradores.value.filter(c => c.rol_id === roleId).length
}

const getVistasForRole = (roleId: number) => {
  const vistaIds = rolVistasMap.value[roleId] || []
  return vistasList.value.filter(v => vistaIds.includes(v.id))
}

const isCategoryAllSelected = (groupVistas: any[]) => {
  return groupVistas.every(v => roleForm.value.selectedVistas.includes(v.id))
}

const toggleCategoryVistas = (groupVistas: any[]) => {
  const allSelected = isCategoryAllSelected(groupVistas)
  const ids = groupVistas.map(v => v.id)

  if (allSelected) {
    roleForm.value.selectedVistas = roleForm.value.selectedVistas.filter(id => !ids.includes(id))
  } else {
    const newSelected = new Set([...roleForm.value.selectedVistas, ...ids])
    roleForm.value.selectedVistas = Array.from(newSelected)
  }
}

// Modales y Acciones
const openCreateModal = () => {
  isEditing.value = false
  editingRoleId.value = null
  roleForm.value = {
    rol: '',
    descripcion: '',
    selectedVistas: []
  }
  isModalOpen.value = true
}

const openEditModal = (roleItem: any) => {
  isEditing.value = true
  editingRoleId.value = roleItem.id
  const assignedVistas = rolVistasMap.value[roleItem.id] || []
  
  roleForm.value = {
    rol: roleItem.rol,
    descripcion: roleItem.descripcion || '',
    selectedVistas: [...assignedVistas]
  }
  isModalOpen.value = true
}

const closeRoleModal = () => {
  if (saving.value) return
  isModalOpen.value = false
}

const saveRole = async () => {
  const rolName = roleForm.value.rol.trim().toUpperCase()
  if (!rolName) {
    showToast('El nombre del rol es obligatorio', 'error')
    return
  }

  saving.value = true
  try {
    let roleId = editingRoleId.value

    if (isEditing.value && roleId) {
      // 1. Actualizar Rol existente
      const { error: updateErr } = await supabase
        .from('roles')
        .update({
          rol: rolName,
          descripcion: roleForm.value.descripcion
        })
        .eq('id', roleId)

      if (updateErr) throw updateErr
    } else {
      // 2. Crear nuevo Rol
      const { data: newRole, error: insertErr } = await supabase
        .from('roles')
        .insert({
          rol: rolName,
          descripcion: roleForm.value.descripcion
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      roleId = newRole.id
    }

    // 3. Sincronizar Rol-Vistas en Supabase si la tabla existe
    if (roleId && !missingTablesWarning.value) {
      // Eliminar asignaciones actuales
      await supabase.from('rol_vistas').delete().eq('rol_id', roleId)

      // Insertar nuevas asignaciones
      if (roleForm.value.selectedVistas.length > 0) {
        const inserts = roleForm.value.selectedVistas.map(vId => ({
          rol_id: roleId,
          vista_id: vId
        }))
        await supabase.from('rol_vistas').insert(inserts)
      }
    }

    showToast(isEditing.value ? 'Rol actualizado correctamente' : 'Rol creado exitosamente')
    closeRoleModal()
    await fetchData()
  } catch (err: any) {
    console.error('Error saving role:', err)
    showToast(err.message || 'Error al guardar el rol', 'error')
  } finally {
    saving.value = false
  }
}

const openDeleteModal = (roleItem: any) => {
  deletingRole.value = roleItem
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  if (deleting.value) return
  isDeleteModalOpen.value = false
  setTimeout(() => {
    deletingRole.value = null
  }, 300)
}

const confirmDeleteRole = async () => {
  if (!deletingRole.value) return
  const roleId = deletingRole.value.id

  if (getColaboradoresCount(roleId) > 0) {
    showToast('No se puede eliminar un rol con colaboradores asignados', 'error')
    return
  }

  deleting.value = true
  try {
    const { error: delErr } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId)

    if (delErr) throw delErr

    showToast(`Rol "${deletingRole.value.rol}" eliminado correctamente`)
    closeDeleteModal()
    await fetchData()
  } catch (err: any) {
    console.error('Error deleting role:', err)
    showToast(err.message || 'Error al eliminar el rol', 'error')
  } finally {
    deleting.value = false
  }
}
</script>
