<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    
    <!-- Encabezado -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <div class="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <Users class="w-6 h-6" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-base-content tracking-tight">Gestión de Usuarios</h1>
        </div>
        <p class="text-xs sm:text-sm text-base-content/60 font-medium">
          Administra los colaboradores del sistema, sus roles de acceso y los proyectos asignados.
        </p>
      </div>

      <button class="btn btn-primary btn-sm sm:btn-md rounded-2xl font-bold gap-2 shadow-sm" @click="fetchUsuarios">
        <RefreshCw class="w-4 h-4" :class="{'animate-spin': loading}" />
        Actualizar
      </button>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center my-16">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    
    <!-- Tabla de Usuarios -->
    <div v-else class="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="bg-base-200/70 text-base-content/80 text-xs font-black uppercase tracking-wider">
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol</th>
              <th>Proyectos Asignados</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuarios" :key="user.id" class="hover:bg-base-200/40 transition-colors">
              
              <!-- Usuario e Iniciales -->
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary/10 text-primary rounded-2xl w-10 h-10 font-black text-xs border border-primary/20 flex items-center justify-center">
                      <span>{{ getInitials(user.nombre || user.email) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="font-black text-sm text-base-content">{{ user.nombre || 'Sin nombre' }}</div>
                    <div class="text-xs text-base-content/60 lowercase font-medium">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Contacto -->
              <td>
                <div class="text-xs font-semibold text-base-content/80">
                  {{ user.telefono || 'N/A' }}
                </div>
              </td>

              <!-- Rol -->
              <td>
                <div class="badge font-black text-[11px] py-2 px-2.5 uppercase" :class="getRoleColor(user.roles?.rol)">
                  {{ user.roles?.rol || 'Sin Rol' }}
                </div>
              </td>

              <!-- Proyectos Asignados -->
              <td>
                <div class="flex flex-wrap gap-1.5 max-w-[280px]">
                  <span 
                    v-for="pc in user.proyecto_colaboradores" 
                    :key="pc.proyecto_id" 
                    class="badge badge-sm badge-outline badge-primary font-bold shadow-2xs py-2 px-2.5 gap-1 rounded-xl"
                  >
                    <FolderKanban class="w-3 h-3" />
                    {{ pc.proyectos?.nombre || `Proyecto #${pc.proyecto_id}` }}
                  </span>
                  <span v-if="!user.proyecto_colaboradores?.length" class="text-xs text-base-content/40 italic font-medium">
                    Sin proyectos asignados
                  </span>
                </div>
              </td>

              <!-- Estado -->
              <td>
                <div class="badge font-black text-xs py-2 px-2.5 gap-1.5" :class="user.aprobado ? 'badge-success text-success-content' : 'badge-error text-error-content'">
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ user.aprobado ? 'Activo' : 'Bloqueado' }}
                </div>
              </td>

              <!-- Acciones -->
              <th class="text-right">
                <button class="btn btn-ghost btn-sm rounded-xl font-bold gap-1 text-primary hover:bg-primary/10" @click="openEditModal(user)">
                  <Pencil class="w-3.5 h-3.5" />
                  Editar
                </button>
              </th>

            </tr>

            <tr v-if="usuarios.length === 0">
              <td colspan="6" class="text-center py-12 text-base-content/60 italic font-medium">
                No se encontraron usuarios registrados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <dialog id="edit_user_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isModalOpen}">
      <div class="modal-box bg-base-100 shadow-2xl border border-base-200 max-w-2xl rounded-3xl p-6 sm:p-8">
        
        <div class="flex items-center justify-between border-b border-base-200 pb-4 mb-6">
          <div class="flex items-center gap-2.5">
            <div class="p-2 bg-primary/10 text-primary rounded-xl">
              <Pencil class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-black text-xl text-base-content">Editar Usuario</h3>
              <p class="text-xs text-base-content/60">Actualiza los datos, rol y proyectos asignados del colaborador.</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm btn-circle text-base-content/60" @click="closeEditModal" :disabled="saving">✕</button>
        </div>
        
        <div v-if="editingUser" class="space-y-5">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="label pb-1.5"><span class="label-text font-bold text-xs">Nombre Completo</span></label>
              <input type="text" v-model="editForm.nombre" class="input input-bordered w-full h-11 text-sm bg-base-200/50 rounded-xl focus:border-primary" />
            </div>
            <div>
              <label class="label pb-1.5"><span class="label-text font-bold text-xs">Teléfono</span></label>
              <input type="text" v-model="editForm.telefono" class="input input-bordered w-full h-11 text-sm bg-base-200/50 rounded-xl focus:border-primary" />
            </div>
            <div class="sm:col-span-2">
              <label class="label pb-1.5"><span class="label-text font-bold text-xs text-base-content/70">Correo Electrónico (Solo lectura)</span></label>
              <input type="email" :value="editingUser.email" class="input input-bordered w-full h-11 text-sm bg-base-200 text-base-content/70 rounded-xl" readonly />
            </div>
          </div>

          <div class="divider my-1 text-xs uppercase font-extrabold text-base-content/40 tracking-wider">Seguridad y Permisos</div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <!-- Role Selection -->
            <div>
              <label class="label pb-1.5"><span class="label-text font-bold text-xs">Rol del Sistema</span></label>
              <select v-model="editForm.rol_id" class="select select-bordered w-full h-11 text-sm bg-base-200/50 rounded-xl focus:border-primary">
                <option v-for="rol in catRoles" :key="rol.id" :value="rol.id">{{ rol.rol }}</option>
              </select>
            </div>
            
            <!-- Access Toggle -->
            <div>
              <label class="label pb-1.5"><span class="label-text font-bold text-xs">Estado de Acceso</span></label>
              <label class="cursor-pointer flex items-center gap-3 p-2 bg-base-200/50 border border-base-300 rounded-xl h-11">
                <input type="checkbox" v-model="editForm.aprobado" class="toggle toggle-success toggle-sm" />
                <span class="text-xs font-bold" :class="editForm.aprobado ? 'text-success' : 'text-error'">
                  {{ editForm.aprobado ? '✓ Usuario Activo y Aprobado' : '✕ Acceso Bloqueado / Pendiente' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Project Selection -->
          <div class="space-y-2 pt-2">
            <div class="flex items-center justify-between">
              <label class="label-text font-black text-xs uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <FolderKanban class="w-4 h-4 text-primary" />
                Proyectos Asignados
              </label>
              <span class="text-[11px] text-base-content/50 font-medium">
                {{ editForm.selectedProjects.length }} seleccionado(s)
              </span>
            </div>

            <div class="bg-base-200/60 border border-base-300 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto">
              <label 
                v-for="proy in catProyectos" 
                :key="proy.id" 
                class="cursor-pointer flex items-center gap-3 p-2.5 bg-base-100 hover:bg-base-200/80 rounded-xl border border-base-200 shadow-2xs transition-all"
                :class="{'border-primary bg-primary/5': editForm.selectedProjects.includes(proy.id)}"
              >
                <input 
                  type="checkbox" 
                  :value="proy.id" 
                  v-model="editForm.selectedProjects" 
                  class="checkbox checkbox-sm checkbox-primary rounded-md shrink-0" 
                />
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-black text-base-content truncate">{{ proy.nombre }}</span>
                  <span v-if="proy.descripcion" class="text-[10px] text-base-content/60 truncate">{{ proy.descripcion }}</span>
                </div>
              </label>

              <div v-if="catProyectos.length === 0" class="col-span-2 text-center text-xs opacity-50 py-4 italic">
                No hay proyectos registrados en el sistema.
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-action mt-6 pt-4 border-t border-base-200">
          <form method="dialog" class="flex gap-3 w-full justify-end">
            <button class="btn btn-ghost btn-sm rounded-xl font-bold" @click.prevent="closeEditModal" :disabled="saving">Cancelar</button>
            <button class="btn btn-primary btn-sm rounded-xl font-black gap-2 shadow-md" @click.prevent="saveUserChanges" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              <CheckCircle2 v-else class="w-4 h-4" />
              Guardar Cambios
            </button>
          </form>
        </div>
      </div>
      <!-- Backdrop to close -->
      <form method="dialog" class="modal-backdrop" @click.prevent="closeEditModal">
        <button>close</button>
      </form>
    </dialog>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast toast-end toast-bottom z-50 p-4">
      <div 
        class="alert font-bold text-sm shadow-2xl rounded-2xl flex items-center gap-3 border"
        :class="toastType === 'error' ? 'alert-error border-error/30' : 'alert-success border-success/30'"
      >
        <AlertCircle v-if="toastType === 'error'" class="w-5 h-5 shrink-0" />
        <CheckCircle2 v-else class="w-5 h-5 shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, RefreshCw, Pencil, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  middleware: ['admin'],
})

const supabase = useSupabaseClient()
const loading = ref(true)
const saving = ref(false)
const usuarios = ref<any[]>([])

// Catálogos
const catRoles = ref<any[]>([])
const catProyectos = ref<any[]>([])

// Modal State
const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const editForm = ref({
  nombre: '',
  telefono: '',
  rol_id: null as number | null,
  aprobado: false,
  selectedProjects: [] as number[]
})

// Toast
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimeout: NodeJS.Timeout | null = null

const mostrarToast = (msg: string, type: 'success' | 'error' = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = msg
  toastType.value = type
  toastTimeout = setTimeout(() => {
    toastMessage.value = ''
  }, 4000)
}

onMounted(async () => {
  await fetchCatalogs()
  await fetchUsuarios()
})

const fetchCatalogs = async () => {
  try {
    const [rolesRes, proyectosRes] = await Promise.all([
      supabase.from('roles').select('*').order('id', { ascending: true }),
      supabase.from('proyectos').select('*').eq('activo', true).order('nombre', { ascending: true })
    ])
    if (rolesRes.data) catRoles.value = rolesRes.data
    if (proyectosRes.data) catProyectos.value = proyectosRes.data
  } catch (err) {
    console.error('Error al cargar catálogos:', err)
  }
}

const fetchUsuarios = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        *,
        roles (id, rol, descripcion),
        proyecto_colaboradores (proyecto_id, proyectos(id, nombre))
      `)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    if (data) usuarios.value = data
  } catch (err: any) {
    console.error('Error fetching users:', err)
    mostrarToast('Error al cargar usuarios: ' + (err.message || err), 'error')
  } finally {
    loading.value = false
  }
}

const openEditModal = (user: any) => {
  editingUser.value = user
  editForm.value = {
    nombre: user.nombre || '',
    telefono: user.telefono || '',
    rol_id: user.rol_id,
    aprobado: user.aprobado || false,
    selectedProjects: user.proyecto_colaboradores?.map((pc: any) => pc.proyecto_id) || []
  }
  isModalOpen.value = true
}

const closeEditModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  setTimeout(() => {
    editingUser.value = null
  }, 300)
}

const saveUserChanges = async () => {
  if (!editingUser.value) return
  
  saving.value = true
  try {
    const userId = editingUser.value.id
    
    // 1. Actualizar información básica en colaboradores
    const { error: updateError } = await supabase
      .from('colaboradores')
      .update({
        nombre: editForm.value.nombre,
        telefono: editForm.value.telefono,
        rol_id: editForm.value.rol_id,
        aprobado: editForm.value.aprobado
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // 2. Sincronizar proyectos asignados en proyecto_colaboradores
    const currentProjects = editingUser.value.proyecto_colaboradores?.map((pc: any) => pc.proyecto_id) || []
    const targetProjects = editForm.value.selectedProjects || []

    const projectsToAdd = targetProjects.filter((id: number) => !currentProjects.includes(id))
    const projectsToRemove = currentProjects.filter((id: number) => !targetProjects.includes(id))

    if (projectsToAdd.length > 0) {
      const inserts = projectsToAdd.map((proyecto_id: number) => ({
        colaborador_id: userId,
        proyecto_id: proyecto_id,
        activo: true
      }))
      const { error: insertError } = await supabase.from('proyecto_colaboradores').insert(inserts)
      if (insertError) throw insertError
    }

    if (projectsToRemove.length > 0) {
      const { error: deleteError } = await supabase.from('proyecto_colaboradores')
        .delete()
        .eq('colaborador_id', userId)
        .in('proyecto_id', projectsToRemove)
      if (deleteError) throw deleteError
    }

    mostrarToast('Usuario actualizado correctamente', 'success')
    await fetchUsuarios()
    closeEditModal()
  } catch (err: any) {
    console.error('Error saving user changes:', err)
    mostrarToast('Hubo un error al guardar los cambios: ' + (err.message || err), 'error')
  } finally {
    saving.value = false
  }
}

// Helpers
const getInitials = (str: string) => {
  if (!str) return 'U'
  return str.substring(0, 2).toUpperCase()
}

const getRoleColor = (rol: string) => {
  switch (rol?.toUpperCase()) {
    case 'ADMIN': return 'badge-error badge-outline'
    case 'GERENTE OPERACIONES': return 'badge-warning badge-outline'
    case 'USER': return 'badge-info badge-outline'
    default: return 'badge-neutral badge-outline'
  }
}
</script>

