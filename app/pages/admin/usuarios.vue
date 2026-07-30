<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-base-content">Gestión de Usuarios</h1>
      <button class="btn btn-primary" @click="fetchUsuarios">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Actualizar
      </button>
    </div>

    <div v-if="loading" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    
    <div v-else class="bg-base-100 rounded-xl shadow-sm border border-base-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr class="bg-base-200 text-base-content/80 text-sm">
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol</th>
              <th>Proyectos Asignados</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usuarios" :key="user.id" class="hover:bg-base-200/50 transition-colors">
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content rounded-full w-10">
                      <span class="text-xs uppercase">{{ getInitials(user.nombre || user.email) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="font-bold">{{ user.nombre || 'Sin nombre' }}</div>
                    <div class="text-sm opacity-50">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="text-sm">{{ user.telefono || 'N/A' }}</div>
              </td>
              <td>
                <div class="badge badge-outline shadow-sm" :class="getRoleColor(user.roles?.rol)">
                  {{ user.roles?.rol || 'Sin Rol' }}
                </div>
              </td>
              <td>
                <div class="flex flex-wrap gap-1 max-w-[200px]">
                  <span v-for="gc in user.grupo_colaboradores" :key="gc.grupo_id" class="badge badge-sm bg-base-200 border-base-300">
                    {{ gc.grupos?.nombre || '?' }}
                  </span>
                  <span v-if="!user.grupo_colaboradores?.length" class="text-xs opacity-50 italic">Ninguno</span>
                </div>
              </td>
              <td>
                <div class="badge" :class="user.aprobado ? 'badge-success badge-outline' : 'badge-error badge-outline'">
                  {{ user.aprobado ? 'Activo' : 'Bloqueado' }}
                </div>
              </td>
              <th class="text-right">
                <button class="btn btn-ghost btn-sm" @click="openEditModal(user)">
                  Editar
                </button>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <dialog id="edit_user_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-xl border border-base-200 max-w-2xl">
        <h3 class="font-bold text-2xl mb-6">Editar Usuario</h3>
        
        <div v-if="editingUser" class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Nombre</span></label>
              <input type="text" v-model="editForm.nombre" class="input input-bordered w-full focus:input-primary" />
            </div>
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Teléfono</span></label>
              <input type="text" v-model="editForm.telefono" class="input input-bordered w-full focus:input-primary" />
            </div>
            <div class="form-control w-full md:col-span-2">
              <label class="label"><span class="label-text font-medium">Correo (Solo lectura)</span></label>
              <input type="email" :value="editingUser.email" class="input input-bordered w-full bg-base-200" readonly />
            </div>
          </div>

          <div class="divider my-2">Seguridad y Acceso</div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Role Selection -->
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Rol del Sistema</span></label>
              <select v-model="editForm.rol_id" class="select select-bordered focus:select-primary">
                <option v-for="rol in catRoles" :key="rol.id" :value="rol.id">{{ rol.rol }}</option>
              </select>
            </div>
            
            <!-- Access Toggle -->
            <div class="form-control w-full">
              <label class="label"><span class="label-text font-medium">Acceso al Sistema</span></label>
              <label class="cursor-pointer label justify-start gap-4 p-0 mt-2">
                <input type="checkbox" v-model="editForm.aprobado" class="toggle toggle-success" />
                <span class="label-text" :class="editForm.aprobado ? 'text-success font-semibold' : 'text-error font-semibold'">
                  {{ editForm.aprobado ? 'Usuario Activo' : 'Acceso Bloqueado' }}
                </span>
              </label>
            </div>
          </div>

          <!-- Project Selection -->
          <div class="form-control mt-4">
            <label class="label"><span class="label-text font-medium">Proyectos Asignados</span></label>
            <div class="bg-base-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              <label v-for="grupo in catGrupos" :key="grupo.id" class="cursor-pointer label justify-start gap-3 p-1 hover:bg-base-300 rounded transition-colors">
                <input type="checkbox" :value="grupo.id" v-model="editForm.selectedGroups" class="checkbox checkbox-sm checkbox-primary" />
                <span class="label-text">{{ grupo.nombre }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-action mt-8">
          <form method="dialog" class="flex gap-3 w-full justify-end">
            <button class="btn btn-ghost" @click.prevent="closeEditModal" :disabled="saving">Cancelar</button>
            <button class="btn btn-primary" @click.prevent="saveUserChanges" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
})

const supabase = useSupabaseClient()
const loading = ref(true)
const saving = ref(false)
const usuarios = ref<any[]>([])

// Catálogos
const catRoles = ref<any[]>([])
const catGrupos = ref<any[]>([])

// Modal State
const isModalOpen = ref(false)
const editingUser = ref<any>(null)
const editForm = ref({
  nombre: '',
  telefono: '',
  rol_id: null as number | null,
  aprobado: false,
  selectedGroups: [] as number[]
})

onMounted(async () => {
  await fetchCatalogs()
  await fetchUsuarios()
})

const fetchCatalogs = async () => {
  const [rolesRes, gruposRes] = await Promise.all([
    supabase.from('roles').select('*'),
    supabase.from('grupos').select('*')
  ])
  if (rolesRes.data) catRoles.value = rolesRes.data
  if (gruposRes.data) catGrupos.value = gruposRes.data
}

const fetchUsuarios = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('colaboradores')
      .select(`
        *,
        roles (id, rol, descripcion),
        grupo_colaboradores (grupo_id, grupos(nombre))
      `)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    if (data) usuarios.value = data
  } catch (err) {
    console.error('Error fetching users:', err)
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
    selectedGroups: user.grupo_colaboradores?.map((gc: any) => gc.grupo_id) || []
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
    
    // 1. Update basic info in colaboradores
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

    // 2. Sync groups in grupo_colaboradores
    const currentGroups = editingUser.value.grupo_colaboradores?.map((gc: any) => gc.grupo_id) || []
    const targetGroups = editForm.value.selectedGroups

    const groupsToAdd = targetGroups.filter(id => !currentGroups.includes(id))
    const groupsToRemove = currentGroups.filter((id: number) => !targetGroups.includes(id))

    if (groupsToAdd.length > 0) {
      const inserts = groupsToAdd.map(grupo_id => ({
        colaborador_id: userId,
        grupo_id: grupo_id,
        activo: true
      }))
      await supabase.from('grupo_colaboradores').insert(inserts)
    }

    if (groupsToRemove.length > 0) {
      await supabase.from('grupo_colaboradores')
        .delete()
        .eq('colaborador_id', userId)
        .in('grupo_id', groupsToRemove)
    }

    // Refresh UI
    await fetchUsuarios()
    closeEditModal()
  } catch (err) {
    console.error('Error saving user changes:', err)
    alert('Hubo un error al guardar los cambios.')
  } finally {
    saving.value = false
  }
}

// Helpers
const getInitials = (str: string) => {
  if (!str) return 'U'
  return str.substring(0, 2)
}

const getRoleColor = (rol: string) => {
  switch (rol?.toUpperCase()) {
    case 'ADMIN': return 'border-error text-error'
    case 'USER': return 'border-info text-info'
    default: return 'border-base-content text-base-content'
  }
}
</script>
