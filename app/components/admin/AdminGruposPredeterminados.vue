<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
      <div>
        <h2 class="text-xl font-bold text-base-content flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Grupos de Tareas Por Defecto (Plantillas Globales)
        </h2>
        <p class="text-xs sm:text-sm text-base-content/70 mt-1">
          Define plantillas globales de tareas que todos los proyectos podrán ver y utilizar como base.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button class="btn btn-outline btn-sm gap-2" @click="openNuevaTareaModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Tarea Maestra
        </button>
        <button class="btn btn-primary btn-sm gap-2 shadow-md" @click="openGrupoModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Grupo Por Defecto
        </button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toastMessage" class="toast toast-end toast-bottom z-50">
      <div class="alert" :class="toastType === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <!-- Indicator -->
    <div v-if="loading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="space-y-6">
      <!-- Lista de Grupos por defecto -->
      <div v-if="gruposDefault.length === 0" class="alert bg-base-100 border border-base-200 p-8 text-center flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <span class="font-bold text-lg text-base-content">No hay ningún grupo por defecto configurado</span>
        <p class="text-xs text-base-content/60 max-w-md mt-1">
          Crea el primer grupo por defecto para que los proyectos lo hereden y puedan utilizar sus tareas automáticamente.
        </p>
        <button class="btn btn-primary btn-sm mt-4 gap-2" @click="openGrupoModal()">
          Crear Grupo Por Defecto
        </button>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          v-for="grupo in gruposDefault" 
          :key="grupo.id" 
          class="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 flex flex-col justify-between hover:border-primary/40 transition-all"
        >
          <div>
            <div class="flex justify-between items-start mb-3 gap-2">
              <div>
                <span class="badge badge-accent badge-sm uppercase tracking-wider font-bold mb-1">
                  ⭐ Por Defecto Global
                </span>
                <h3 class="text-lg font-bold text-base-content">{{ grupo.nombre }}</h3>
              </div>
              <div class="flex items-center gap-1">
                <button class="btn btn-ghost btn-xs text-info" @click="openGrupoModal(grupo)" title="Editar Grupo">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="btn btn-ghost btn-xs text-error" @click="eliminarGrupo(grupo.id)" title="Eliminar Grupo">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <p class="text-xs text-base-content/70 line-clamp-2 mb-4">
              {{ grupo.descripcion || 'Sin descripción.' }}
            </p>

            <!-- Recurrencia Info -->
            <div class="bg-base-200/60 rounded-xl p-3 mb-4 flex flex-wrap gap-3 text-xs">
              <div>
                <span class="font-semibold text-base-content/60">Recurrencia:</span>
                <span class="ml-1 font-bold text-primary capitalize">{{ grupo.recurrencia_tipo || 'No configurada' }}</span>
              </div>
              <div v-if="grupo.recurrencia_tipo === 'diario'">
                <span class="font-semibold text-base-content/60">Día asignado:</span>
                <span class="ml-1 font-bold text-secondary">{{ getDiaSemanaNombre(grupo.dia_semana) }}</span>
              </div>
              <div v-else-if="grupo.recurrencia_tipo === 'semanal'">
                <span class="font-semibold text-base-content/60">Frecuencia:</span>
                <span class="ml-1 font-bold">Todos los días de la semana</span>
              </div>
              <div v-else-if="grupo.recurrencia_tipo === 'mensual'">
                <span class="font-semibold text-base-content/60">Frecuencia:</span>
                <span class="ml-1 font-bold">Todos los días del mes</span>
              </div>
            </div>

            <!-- Tareas del grupo -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2 flex items-center justify-between">
                <span>Tareas Asignadas ({{ getTareasDelGrupo(grupo.id).length }})</span>
              </h4>
              <div class="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                <div 
                  v-for="tarea in getTareasDelGrupo(grupo.id)" 
                  :key="tarea.id"
                  class="flex items-center justify-between p-2 rounded-lg bg-base-200/40 text-xs border border-base-200"
                >
                  <span class="font-medium text-base-content">{{ tarea.nombre }}</span>
                  <span class="badge badge-xs badge-neutral">ID: {{ tarea.id }}</span>
                </div>
                <div v-if="getTareasDelGrupo(grupo.id).length === 0" class="text-xs italic text-base-content/40 py-2 text-center">
                  Ninguna tarea asignada a este grupo por defecto
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear / Editar Grupo Por Defecto -->
    <dialog id="grupo_default_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isGrupoModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200 max-w-2xl">
        <h3 class="font-bold text-xl mb-4 text-base-content">
          {{ editingGrupoId ? 'Editar Grupo Por Defecto' : 'Crear Grupo Por Defecto' }}
        </h3>

        <form @submit.prevent="guardarGrupo" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Nombre del Grupo <span class="text-error">*</span></span></label>
            <input type="text" v-model="grupoForm.nombre" placeholder="Ej. Checklist Mantenimiento Diario" class="input input-bordered w-full focus:input-primary" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Descripción</span></label>
            <textarea v-model="grupoForm.descripcion" placeholder="Describa el objetivo de este grupo por defecto..." class="textarea textarea-bordered w-full h-20 resize-none focus:textarea-primary"></textarea>
          </div>

          <!-- Recurrencia -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/50 p-4 rounded-xl border border-base-200">
            <div class="form-control">
              <label class="label"><span class="label-text font-bold">Tipo de Recurrencia</span></label>
              <select v-model="grupoForm.recurrencia_tipo" class="select select-bordered w-full">
                <option value="diario">Diario (Día específico de la semana)</option>
                <option value="semanal">Semanal (Todos los días de la semana)</option>
                <option value="mensual">Mensual (Todos los días del mes)</option>
              </select>
            </div>

            <div v-if="grupoForm.recurrencia_tipo === 'diario'" class="form-control">
              <label class="label"><span class="label-text font-bold">Día Específico de la Semana</span></label>
              <select v-model="grupoForm.dia_semana" class="select select-bordered w-full">
                <option :value="1">Lunes</option>
                <option :value="2">Martes</option>
                <option :value="3">Miércoles</option>
                <option :value="4">Jueves</option>
                <option :value="5">Viernes</option>
                <option :value="6">Sábado</option>
                <option :value="7">Domingo</option>
              </select>
            </div>

            <div v-else-if="grupoForm.recurrencia_tipo === 'semanal'" class="form-control justify-center">
              <span class="text-xs text-base-content/70 italic">
                Las tareas de este grupo se repetirán de Lunes a Domingo.
              </span>
            </div>

            <div v-else-if="grupoForm.recurrencia_tipo === 'mensual'" class="form-control justify-center">
              <span class="text-xs text-base-content/70 italic">
                Las tareas de este grupo se repetirán del día 1 al 31 de cada mes.
              </span>
            </div>
          </div>

          <!-- Selección de Tareas Maestras -->
          <div class="form-control">
            <label class="label justify-between">
              <span class="label-text font-bold">Tareas Incluidas en la Plantilla</span>
              <span class="label-text-alt text-xs font-semibold text-primary">{{ grupoForm.selectedTareas.length }} seleccionadas</span>
            </label>
            <div class="bg-base-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 border border-base-300">
              <label v-for="t in catalogTareas" :key="t.id" class="flex items-center gap-3 p-2 rounded-lg bg-base-100 hover:bg-base-300 cursor-pointer border border-base-200">
                <input type="checkbox" :value="t.id" v-model="grupoForm.selectedTareas" class="checkbox checkbox-sm checkbox-primary" />
                <span class="text-sm font-medium text-base-content">{{ t.nombre }}</span>
              </label>
              <div v-if="catalogTareas.length === 0" class="text-xs text-center py-3 text-base-content/50">
                No hay tareas maestras creadas. ¡Crea una primero!
              </div>
            </div>
          </div>

          <div class="modal-action pt-4 border-t border-base-200">
            <button type="button" class="btn btn-ghost" @click="closeGrupoModal" :disabled="saving">Cancelar</button>
            <button type="submit" class="btn btn-primary px-6" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              Guardar Grupo Por Defecto
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeGrupoModal"><button>close</button></form>
    </dialog>

    <!-- Modal Nueva Tarea Maestra -->
    <dialog id="tarea_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isTareaModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200">
        <h3 class="font-bold text-xl mb-4 text-base-content">Nueva Tarea Maestra</h3>
        <form @submit.prevent="guardarTareaMaestra" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Nombre de la Tarea <span class="text-error">*</span></span></label>
            <input type="text" v-model="nuevaTarea.nombre" placeholder="Ej. Limpieza general de área" class="input input-bordered w-full focus:input-primary" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Descripción</span></label>
            <textarea v-model="nuevaTarea.descripcion" placeholder="Detalles de la tarea..." class="textarea textarea-bordered w-full resize-none"></textarea>
          </div>
          <div class="modal-action">
            <button type="button" class="btn btn-ghost" @click="isTareaModalOpen = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="savingTarea">Guardar Tarea</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isTareaModalOpen = false"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()

const loading = ref(true)
const saving = ref(false)
const savingTarea = ref(false)

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const gruposDefault = ref<any[]>([])
const catalogTareas = ref<any[]>([])
const tareasRecurrentes = ref<any[]>([])

// Modal Grupo State
const isGrupoModalOpen = ref(false)
const editingGrupoId = ref<number | null>(null)
const grupoForm = ref({
  nombre: '',
  descripcion: '',
  recurrencia_tipo: 'semanal' as string | null,
  dia_semana: 1,
  dia_mes: 1,
  selectedTareas: [] as number[]
})

// Modal Tarea State
const isTareaModalOpen = ref(false)
const nuevaTarea = ref({
  nombre: '',
  descripcion: ''
})

onMounted(async () => {
  await fetchData()
})

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => toastMessage.value = '', 4000)
}

const fetchData = async () => {
  loading.value = true
  try {
    // 1. Grupos por defecto (es_predeterminado = true OR proyecto_id IS NULL)
    const { data: gData, error: gErr } = await supabase
      .from('grupos')
      .select('*')
      .or('es_predeterminado.eq.true,proyecto_id.is.null')
      .order('id', { ascending: true })

    if (gErr) throw gErr
    gruposDefault.value = gData || []

    // 2. Catálogo de tareas maestras
    const { data: tData } = await supabase
      .from('tareas')
      .select('*')
      .eq('activa', true)
      .order('nombre', { ascending: true })

    catalogTareas.value = tData || []

    // 3. Tareas recurrentes asociadas
    const { data: trData } = await supabase
      .from('tareas_recurrentes')
      .select('*')

    tareasRecurrentes.value = trData || []

  } catch (err: any) {
    console.error('Error al cargar grupos por defecto:', err)
    showToast('Error al cargar plantillas por defecto', 'error')
  } finally {
    loading.value = false
  }
}

const getTareasDelGrupo = (grupoId: number) => {
  const tareaIds = tareasRecurrentes.value
    .filter(tr => tr.grupo_id === grupoId)
    .map(tr => tr.tarea_id)
  return catalogTareas.value.filter(t => tareaIds.includes(t.id))
}

const getDiaSemanaNombre = (dia: number) => {
  const dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  return dias[dia] || 'N/A'
}

const openGrupoModal = (grupo?: any) => {
  if (grupo) {
    editingGrupoId.value = grupo.id
    const assignedTareaIds = tareasRecurrentes.value
      .filter(tr => tr.grupo_id === grupo.id)
      .map(tr => tr.tarea_id)

    grupoForm.value = {
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      recurrencia_tipo: grupo.recurrencia_tipo || null,
      dia_semana: grupo.dia_semana || 1,
      dia_mes: grupo.dia_mes || 1,
      selectedTareas: assignedTareaIds
    }
  } else {
    editingGrupoId.value = null
    grupoForm.value = {
      nombre: '',
      descripcion: '',
      recurrencia_tipo: 'diario',
      dia_semana: 1,
      dia_mes: 1,
      selectedTareas: []
    }
  }
  isGrupoModalOpen.value = true
}

const closeGrupoModal = () => {
  if (saving.value) return
  isGrupoModalOpen.value = false
}

const guardarGrupo = async () => {
  if (!grupoForm.value.nombre.trim()) return
  saving.value = true

  try {
    const payload: any = {
      nombre: grupoForm.value.nombre.trim(),
      descripcion: grupoForm.value.descripcion.trim(),
      es_predeterminado: true,
      proyecto_id: null,
      recurrencia_tipo: grupoForm.value.recurrencia_tipo,
      dia_semana: grupoForm.value.recurrencia_tipo === 'diario' ? grupoForm.value.dia_semana : null,
      dia_mes: null
    }

    let gId = editingGrupoId.value

    if (gId) {
      const { error: uErr } = await supabase.from('grupos').update(payload).eq('id', gId)
      if (uErr) throw uErr
    } else {
      const { data: newG, error: iErr } = await supabase.from('grupos').insert(payload).select().single()
      if (iErr) throw iErr
      gId = newG.id
    }

    // Sincronizar tareas recurrentes
    if (gId) {
      await supabase.from('tareas_recurrentes').delete().eq('grupo_id', gId)
      if (grupoForm.value.selectedTareas.length > 0) {
        const inserts = grupoForm.value.selectedTareas.map((tId, idx) => ({
          grupo_id: gId,
          tarea_id: tId,
          orden: idx + 1
        }))
        await supabase.from('tareas_recurrentes').insert(inserts)
      }
    }

    showToast('Grupo por defecto guardado correctamente')
    closeGrupoModal()
    await fetchData()
  } catch (err: any) {
    console.error('Error al guardar grupo por defecto:', err)
    showToast(err.message || 'Error al guardar el grupo', 'error')
  } finally {
    saving.value = false
  }
}

const eliminarGrupo = async (grupoId: number) => {
  if (!confirm('¿Estás seguro de eliminar este grupo por defecto?')) return
  try {
    const { error } = await supabase.from('grupos').delete().eq('id', grupoId)
    if (error) throw error
    showToast('Grupo por defecto eliminado')
    await fetchData()
  } catch (err: any) {
    showToast(err.message || 'Error al eliminar el grupo', 'error')
  }
}

// Tarea Maestra
const openNuevaTareaModal = () => {
  nuevaTarea.value = { nombre: '', descripcion: '' }
  isTareaModalOpen.value = true
}

const guardarTareaMaestra = async () => {
  if (!nuevaTarea.value.nombre.trim()) return
  savingTarea.value = true
  try {
    const { error } = await supabase.from('tareas').insert({
      nombre: nuevaTarea.value.nombre.trim(),
      descripcion: nuevaTarea.value.descripcion.trim(),
      activa: true
    })
    if (error) throw error
    showToast('Tarea maestra creada exitosamente')
    isTareaModalOpen.value = false
    await fetchData()
  } catch (err: any) {
    showToast(err.message || 'Error al crear la tarea', 'error')
  } finally {
    savingTarea.value = false
  }
}
</script>
