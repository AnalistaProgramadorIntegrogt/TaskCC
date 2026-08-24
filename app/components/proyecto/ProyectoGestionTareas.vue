<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200">
      <div>
        <h2 class="text-xl font-bold text-base-content flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Gestión de Tareas y Grupos del Proyecto
        </h2>
        <p class="text-xs sm:text-sm text-base-content/70 mt-1">
          Crea grupos de tareas específicos para este proyecto o personaliza los grupos globales por defecto.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="btn btn-outline btn-success btn-sm gap-1.5 shadow-2xs" @click="descargarPlantilla">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar Plantilla
        </button>
        <button class="btn btn-outline btn-primary btn-sm gap-1.5 shadow-2xs" @click="isCargaMasivaOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Carga Masiva Excel
        </button>
        <button class="btn btn-outline btn-sm gap-2" @click="openNuevaTareaModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Tarea
        </button>
        <button class="btn btn-primary btn-sm gap-2 shadow-md" @click="openGrupoModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Grupo del Proyecto
        </button>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast toast-end toast-bottom z-50">
      <div class="alert" :class="toastType === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else class="space-y-8">
      <!-- Sección 1: Grupos Propios del Proyecto -->
      <div>
        <h3 class="text-lg font-bold text-base-content mb-4 flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-primary inline-block"></span>
          Grupos de Tareas del Proyecto ({{ gruposProyecto.length }})
        </h3>

        <div v-if="gruposProyecto.length === 0" class="alert bg-base-100 border border-base-200 p-6 text-center flex flex-col items-center">
          <span class="font-semibold text-sm text-base-content">Este proyecto aún no tiene grupos de tareas específicos.</span>
          <p class="text-xs text-base-content/60 mt-1">
            Puedes crear un grupo nuevo para este proyecto o personalizar la plantilla por defecto global abajo.
          </p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="grupo in gruposProyecto" 
            :key="grupo.id"
            class="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 flex flex-col justify-between hover:border-primary/40 transition-all"
          >
            <div>
              <div class="flex justify-between items-start mb-3 gap-2">
                <div>
                  <span class="badge badge-primary badge-sm font-semibold mb-1">Grupo Específico</span>
                  <h4 class="text-base font-bold text-base-content">{{ grupo.nombre }}</h4>
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

              <!-- Tareas del grupo -->
              <div>
                <h5 class="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                  Tareas Asignadas ({{ getTareasDelGrupo(grupo.id).length }})
                </h5>
                <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  <div 
                    v-for="tarea in getTareasDelGrupo(grupo.id)" 
                    :key="tarea.id"
                    class="flex items-center justify-between p-2 rounded-lg bg-base-200/40 text-xs border border-base-200"
                  >
                    <span class="font-medium text-base-content">{{ tarea.nombre }}</span>
                  </div>
                  <div v-if="getTareasDelGrupo(grupo.id).length === 0" class="text-xs italic text-base-content/40 py-2 text-center">
                    Sin tareas asignadas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider my-4"></div>

      <!-- Sección 2: Grupos Por Defecto Globales -->
      <div>
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 class="text-lg font-bold text-base-content flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-accent inline-block"></span>
            Grupos Por Defecto Globales (Visibles para todos los proyectos)
          </h3>
          <span class="text-xs text-base-content/60">
            Cualquier proyecto puede personalizar su propia versión de estos grupos
          </span>
        </div>

        <div v-if="gruposDefault.length === 0" class="alert bg-base-100 border border-base-200 p-6 text-center text-xs text-base-content/60">
          No hay grupos por defecto registrados a nivel global.
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            v-for="grupo in gruposDefault" 
            :key="grupo.id"
            class="bg-base-100 rounded-2xl p-6 shadow-sm border border-accent/30 flex flex-col justify-between relative overflow-hidden"
          >
            <div class="absolute top-0 right-0 bg-accent/10 text-accent font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl border-l border-b border-accent/20">
              ⭐ Plantilla Global
            </div>

            <div>
              <h4 class="text-base font-bold text-base-content mb-1 pr-24">{{ grupo.nombre }}</h4>
              <p class="text-xs text-base-content/70 line-clamp-2 mb-3">
                {{ grupo.descripcion || 'Sin descripción.' }}
              </p>

              <!-- Tareas del grupo -->
              <div>
                <h5 class="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                  Tareas de la Plantilla ({{ getTareasDelGrupo(grupo.id).length }})
                </h5>
                <div class="space-y-1 max-h-32 overflow-y-auto pr-1">
                  <div 
                    v-for="tarea in getTareasDelGrupo(grupo.id)" 
                    :key="tarea.id"
                    class="p-1.5 rounded bg-base-200/40 text-xs text-base-content/90 font-medium"
                  >
                    • {{ tarea.nombre }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-base-200 flex justify-end">
              <button 
                class="btn btn-accent btn-sm gap-2 text-xs shadow-sm"
                @click="copiarGrupoAlProyecto(grupo)"
                :disabled="cloning"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Personalizar para este proyecto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear / Editar Grupo del Proyecto -->
    <dialog id="grupo_proyecto_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isGrupoModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200 max-w-2xl">
        <h3 class="font-bold text-xl mb-4 text-base-content">
          {{ editingGrupoId ? 'Editar Grupo del Proyecto' : 'Crear Grupo para el Proyecto' }}
        </h3>

        <form @submit.prevent="guardarGrupoProyecto" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Nombre del Grupo <span class="text-error">*</span></span></label>
            <input type="text" v-model="grupoForm.nombre" placeholder="Ej. Tareas Semanales de Almacén" class="input input-bordered w-full focus:input-primary" required />
          </div>

          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Descripción</span></label>
            <textarea v-model="grupoForm.descripcion" placeholder="Describa las tareas de este grupo..." class="textarea textarea-bordered w-full h-20 resize-none focus:textarea-primary"></textarea>
          </div>

          <!-- Selección de Tareas -->
          <div class="form-control">
            <label class="label justify-between">
              <span class="label-text font-bold">Tareas Asignadas</span>
              <span class="label-text-alt text-xs font-semibold text-primary">{{ grupoForm.selectedTareas.length }} seleccionadas</span>
            </label>
            <div class="bg-base-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 border border-base-300">
              <label v-for="t in catalogTareas" :key="t.id" class="flex items-center gap-3 p-2 rounded-lg bg-base-100 hover:bg-base-300 cursor-pointer border border-base-200">
                <input type="checkbox" :value="t.id" v-model="grupoForm.selectedTareas" class="checkbox checkbox-sm checkbox-primary" />
                <span class="text-sm font-medium text-base-content">{{ t.nombre }}</span>
              </label>
              <div v-if="catalogTareas.length === 0" class="text-xs text-center py-3 text-base-content/50">
                No hay tareas disponibles. ¡Crea una primero!
              </div>
            </div>
          </div>

          <div class="modal-action pt-4 border-t border-base-200">
            <button type="button" class="btn btn-ghost" @click="closeGrupoModal" :disabled="saving">Cancelar</button>
            <button type="submit" class="btn btn-primary px-6" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              Guardar Grupo
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeGrupoModal"><button>close</button></form>
    </dialog>

    <!-- Modal Nueva Tarea -->
    <dialog id="tarea_proyecto_modal" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': isTareaModalOpen}">
      <div class="modal-box glass bg-base-100/95 shadow-2xl border border-base-200">
        <h3 class="font-bold text-xl mb-4 text-base-content">Nueva Tarea</h3>
        <form @submit.prevent="guardarTarea" class="space-y-4">
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Nombre de la Tarea <span class="text-error">*</span></span></label>
            <input type="text" v-model="nuevaTarea.nombre" placeholder="Ej. Inspección de Extintores" class="input input-bordered w-full focus:input-primary" required />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text font-bold">Descripción</span></label>
            <textarea v-model="nuevaTarea.descripcion" placeholder="Detalles de la instrucción..." class="textarea textarea-bordered w-full resize-none"></textarea>
          </div>
          <div class="modal-action">
            <button type="button" class="btn btn-ghost" @click="isTareaModalOpen = false">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="savingTarea">Guardar Tarea</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="isTareaModalOpen = false"><button>close</button></form>
    </dialog>

    <!-- Modal Carga Masiva Excel -->
    <ModalCargaMasivaTareas
      :is-open="isCargaMasivaOpen"
      :grupos-disponibles="gruposProyecto"
      @cerrar="isCargaMasivaOpen = false"
      @descargar-plantilla="descargarPlantilla"
      @importacion-completada="onImportacionCompletada"
    />
  </div>
</template>

<script setup lang="ts">
import ModalCargaMasivaTareas from '~/components/admin/ModalCargaMasivaTareas.vue'
import { useExcelTareas } from '~/composables/useExcelTareas'

const props = defineProps<{
  proyectoId: number
}>()

const supabase = useSupabaseClient()
const { descargarPlantillaExcel } = useExcelTareas()

const loading = ref(true)
const saving = ref(false)
const savingTarea = ref(false)
const cloning = ref(false)

const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const gruposProyecto = ref<any[]>([])
const gruposDefault = ref<any[]>([])
const catalogTareas = ref<any[]>([])
const tareasRecurrentes = ref<any[]>([])

// Modal Carga Masiva State
const isCargaMasivaOpen = ref(false)

// Modal Grupo
const isGrupoModalOpen = ref(false)
const editingGrupoId = ref<number | null>(null)
const grupoForm = ref({
  nombre: '',
  descripcion: '',
  selectedTareas: [] as number[]
})

// Modal Tarea
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
    // 1. Grupos de este proyecto
    const { data: gProjData } = await supabase
      .from('grupos')
      .select('*')
      .eq('proyecto_id', props.proyectoId)
      .eq('es_predeterminado', false)
      .order('id', { ascending: true })

    gruposProyecto.value = gProjData || []

    // 2. Grupos Por Defecto Globales
    const { data: gDefData } = await supabase
      .from('grupos')
      .select('*')
      .or('es_predeterminado.eq.true,proyecto_id.is.null')
      .order('id', { ascending: true })

    gruposDefault.value = gDefData || []

    // 3. Catálogo de Tareas
    const { data: tData } = await supabase
      .from('tareas')
      .select('*')
      .eq('activa', true)
      .order('nombre', { ascending: true })

    catalogTareas.value = tData || []

    // 4. Relación tareas_recurrentes
    const { data: trData } = await supabase
      .from('tareas_recurrentes')
      .select('*')

    tareasRecurrentes.value = trData || []

  } catch (err: any) {
    console.error('Error al cargar gestión de tareas del proyecto:', err)
    showToast('Error al cargar tareas del proyecto', 'error')
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

const openGrupoModal = (grupo?: any) => {
  if (grupo) {
    editingGrupoId.value = grupo.id
    const assignedIds = tareasRecurrentes.value
      .filter(tr => tr.grupo_id === grupo.id)
      .map(tr => tr.tarea_id)

    grupoForm.value = {
      nombre: grupo.nombre,
      descripcion: grupo.descripcion || '',
      selectedTareas: assignedIds
    }
  } else {
    editingGrupoId.value = null
    grupoForm.value = {
      nombre: '',
      descripcion: '',
      selectedTareas: []
    }
  }
  isGrupoModalOpen.value = true
}

const closeGrupoModal = () => {
  if (saving.value) return
  isGrupoModalOpen.value = false
}

const guardarGrupoProyecto = async () => {
  if (!grupoForm.value.nombre.trim()) return
  saving.value = true

  try {
    const payload: any = {
      nombre: grupoForm.value.nombre.trim(),
      descripcion: grupoForm.value.descripcion.trim(),
      es_predeterminado: false,
      proyecto_id: props.proyectoId
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

    showToast('Grupo guardado correctamente para el proyecto')
    closeGrupoModal()
    await fetchData()
  } catch (err: any) {
    showToast(err.message || 'Error al guardar el grupo', 'error')
  } finally {
    saving.value = false
  }
}

const copiarGrupoAlProyecto = async (grupoDefault: any) => {
  cloning.value = true
  try {
    // 1. Crear nuevo grupo para este proyecto
    const { data: newG, error: gErr } = await supabase.from('grupos').insert({
      nombre: `${grupoDefault.nombre} (Proyecto)`,
      descripcion: grupoDefault.descripcion,
      es_predeterminado: false,
      proyecto_id: props.proyectoId
    }).select().single()

    if (gErr) throw gErr

    // 2. Copiar tareas asociadas
    const tareasDefault = tareasRecurrentes.value.filter(tr => tr.grupo_id === grupoDefault.id)
    if (tareasDefault.length > 0) {
      const inserts = tareasDefault.map((tr, idx) => ({
        grupo_id: newG.id,
        tarea_id: tr.tarea_id,
        orden: tr.orden || (idx + 1)
      }))
      await supabase.from('tareas_recurrentes').insert(inserts)
    }

    showToast('Grupo por defecto copiado y personalizado para este proyecto')
    await fetchData()
  } catch (err: any) {
    showToast(err.message || 'Error al copiar plantilla', 'error')
  } finally {
    cloning.value = false
  }
}

const eliminarGrupo = async (grupoId: number) => {
  if (!confirm('¿Eliminar este grupo del proyecto?')) return
  try {
    // 1. Desasociar checklist_tareas (mantiene el grupo_nombre_snapshot histórico)
    await supabase.from('checklist_tareas').update({ grupo_id: null }).eq('grupo_id', grupoId)
    
    // 2. Eliminar relaciones de tareas recurrentes y colaboradores del grupo
    await supabase.from('tareas_recurrentes').delete().eq('grupo_id', grupoId)
    await supabase.from('grupo_colaboradores').delete().eq('grupo_id', grupoId)

    // 3. Eliminar el grupo
    const { error } = await supabase.from('grupos').delete().eq('id', grupoId)
    if (error) throw error

    showToast('Grupo eliminado del proyecto')
    await fetchData()
  } catch (err: any) {
    console.error('Error al eliminar grupo:', err)
    showToast(err.message || 'Error al eliminar grupo', 'error')
  }
}

const openNuevaTareaModal = () => {
  nuevaTarea.value = { nombre: '', descripcion: '' }
  isTareaModalOpen.value = true
}

const guardarTarea = async () => {
  if (!nuevaTarea.value.nombre.trim()) return
  savingTarea.value = true
  try {
    const { error } = await supabase.from('tareas').insert({
      nombre: nuevaTarea.value.nombre.trim(),
      descripcion: nuevaTarea.value.descripcion.trim(),
      activa: true
    })
    if (error) throw error
    showToast('Tarea creada exitosamente')
    isTareaModalOpen.value = false
    await fetchData()
  } catch (err: any) {
    showToast(err.message || 'Error al crear la tarea', 'error')
  } finally {
    savingTarea.value = false
  }
}

// Carga Masiva y Descarga de Plantilla Excel
const descargarPlantilla = () => {
  descargarPlantillaExcel(catalogTareas.value, 'plantilla_tareas_proyecto.xlsx')
  showToast('Plantilla Excel del proyecto descargada correctamente')
}

const onImportacionCompletada = async (res: { creadas: number; actualizadas: number; asociadasAlGrupo: number }) => {
  let mensaje = `Carga masiva completada: ${res.creadas} tarea(s) nueva(s) creadas`
  if (res.actualizadas > 0) {
    mensaje += `, ${res.actualizadas} actualizada(s)`
  }
  if (res.asociadasAlGrupo > 0) {
    mensaje += ` y ${res.asociadasAlGrupo} asociada(s) al grupo del proyecto`
  }
  showToast(mensaje)
  await fetchData()
}
</script>
