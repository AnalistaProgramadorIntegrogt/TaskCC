<template>
  <div class="space-y-6">
    <!-- Encabezado de la Sección de Montajes -->
    <div class="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="p-3 rounded-2xl bg-primary/10 text-primary">
          <Wrench :size="24" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl font-black text-base-content tracking-tight">
              Registro de Montajes
            </h2>
            <span class="badge badge-primary font-black text-[10px] py-2 px-2.5">
              {{ montajesFiltrados.length }} registrados
            </span>
          </div>
          <p class="text-xs text-base-content/60 font-medium mt-0.5">
            Control de actividades de montaje, fecha, hora, responsable y descripción.
          </p>
        </div>
      </div>

      <!-- Botón Registrar Nuevo Montaje -->
      <button 
        class="btn btn-primary btn-sm font-black text-xs gap-2 rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
        @click="abrirModalNuevo"
      >
        <Plus :size="16" />
        <span>Registrar Montaje</span>
      </button>
    </div>

    <!-- Barra de Filtros y Búsqueda -->
    <div class="bg-base-100 p-4 rounded-2xl border border-base-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex flex-1 items-center gap-2 max-w-md bg-base-200/60 px-3 py-1.5 rounded-xl border border-base-300">
        <Search :size="15" class="text-base-content/40" />
        <input 
          type="text" 
          v-model="busqueda"
          placeholder="Buscar por descripción, título o colaborador..." 
          class="bg-transparent text-xs w-full focus:outline-none text-base-content font-medium"
        />
        <button v-if="busqueda" @click="busqueda = ''" class="text-base-content/40 hover:text-base-content text-xs">
          ✕
        </button>
      </div>

      <!-- Filtro por Colaborador -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold text-base-content/60 whitespace-nowrap">Colaborador:</span>
        <select 
          v-model="filtroColaboradorId" 
          class="select select-bordered select-xs font-semibold rounded-xl"
        >
          <option value="todos">Todos los colaboradores</option>
          <option v-for="c in colaboradores" :key="c.id" :value="c.id">
            {{ c.nombre }}
          </option>
        </select>
      </div>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="cargando" class="flex flex-col items-center justify-center py-16 space-y-3 bg-base-100 rounded-3xl border border-base-200">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-xs font-bold text-base-content/60">Cargando registros de montajes...</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="montajesFiltrados.length === 0" class="bg-base-100 rounded-3xl p-12 text-center border border-dashed border-base-300 space-y-3">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
        <Wrench :size="28" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-base-content">No hay registros de montajes</h3>
        <p class="text-xs text-base-content/60 max-w-sm mx-auto">
          {{ busqueda || filtroColaboradorId !== 'todos' ? 'No se encontraron resultados para los filtros seleccionados.' : 'Registra el primer montaje del proyecto con su fecha, hora y responsable.' }}
        </p>
      </div>
      <button 
        v-if="!busqueda && filtroColaboradorId === 'todos'"
        class="btn btn-primary btn-sm font-bold text-xs gap-2 rounded-xl"
        @click="abrirModalNuevo"
      >
        <Plus :size="14" />
        <span>Registrar Primer Montaje</span>
      </button>
    </div>

    <!-- Grid de Montajes Registrados -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div 
        v-for="montaje in montajesFiltrados" 
        :key="montaje.id"
        class="bg-base-100 rounded-3xl p-5 border border-base-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
      >
        <!-- Encabezado de la Tarjeta -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <span 
                class="badge badge-xs text-[9px] font-black uppercase py-1 px-2"
                :class="getEstadoBadgeClass(montaje.estado)"
              >
                {{ montaje.estado || 'Completado' }}
              </span>
              <span class="text-[11px] font-extrabold text-base-content/60 flex items-center gap-1">
                <Calendar :size="12" />
                {{ montaje.fecha }}
              </span>
              <span class="text-[11px] font-extrabold text-base-content/60 flex items-center gap-1">
                <Clock :size="12" />
                {{ montaje.hora }}
              </span>
            </div>

            <!-- Botón Eliminar -->
            <button 
              class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-error transition-colors"
              title="Eliminar montaje"
              @click="confirmarEliminar(montaje)"
            >
              <Trash2 :size="14" />
            </button>
          </div>

          <!-- Título del Montaje -->
          <h3 class="text-sm font-black text-base-content leading-snug">
            {{ montaje.titulo || 'Montaje' }}
          </h3>

          <!-- Descripción Detallada -->
          <div class="p-3 rounded-2xl bg-base-200/50 border border-base-200 text-xs text-base-content/80 leading-relaxed max-h-32 overflow-y-auto">
            {{ montaje.descripcion }}
          </div>
        </div>

        <!-- Pie de la Tarjeta: Colaborador y Foto -->
        <div class="pt-3 border-t border-base-200/80 flex items-center justify-between gap-2">
          <!-- Colaborador que lo realizó -->
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] flex-shrink-0">
              <User :size="13" />
            </div>
            <div class="min-w-0 truncate">
              <span class="text-[9px] font-extrabold uppercase tracking-wider text-base-content/40 block">Realizado por</span>
              <span class="text-xs font-bold text-base-content truncate block">
                {{ obtenerNombreColaborador(montaje) }}
              </span>
            </div>
          </div>

          <!-- Miniatura de Foto si existe -->
          <div v-if="montaje.foto_url" class="flex-shrink-0">
            <button 
              type="button" 
              class="w-9 h-9 rounded-xl overflow-hidden border border-base-300 hover:border-primary transition-all relative group"
              @click="verFotoGrande(montaje.foto_url)"
              title="Ver foto de evidencia"
            >
              <img :src="montaje.foto_url" alt="Foto" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                <Eye :size="12" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         MODAL: REGISTRAR NUEVO MONTAJE
         ========================================================================= -->
    <dialog id="modal_nuevo_montaje" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': modalNuevoOpen}">
      <div class="modal-box rounded-3xl bg-base-100 p-6 shadow-2xl border border-base-200 max-w-lg">
        <div class="flex items-center justify-between pb-3 border-b border-base-200">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-2xl bg-primary/10 text-primary">
              <Wrench :size="18" />
            </div>
            <div>
              <h3 class="font-black text-base text-base-content">
                Registrar Nuevo Montaje
              </h3>
              <p class="text-[11px] text-base-content/60 font-medium">
                Completa los datos del trabajo de montaje realizado.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            class="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content" 
            @click="modalNuevoOpen = false"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="guardarMontaje" class="space-y-4 pt-4">
          <!-- Título o Asunto del Montaje -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Título / Identificador del Montaje <span class="text-error">*</span></span>
            </label>
            <input 
              type="text" 
              v-model="form.titulo" 
              placeholder="Ej. Montaje de estructura en Plaza Central" 
              class="input input-bordered input-sm w-full rounded-xl text-xs" 
              required 
            />
          </div>

          <!-- Grid: Fecha y Hora -->
          <div class="grid grid-cols-2 gap-3">
            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-bold text-xs">Fecha <span class="text-error">*</span></span>
              </label>
              <input 
                type="date" 
                v-model="form.fecha" 
                class="input input-bordered input-sm w-full rounded-xl text-xs" 
                required 
              />
            </div>

            <div class="form-control">
              <label class="label py-1">
                <span class="label-text font-bold text-xs">Hora <span class="text-error">*</span></span>
              </label>
              <input 
                type="time" 
                v-model="form.hora" 
                class="input input-bordered input-sm w-full rounded-xl text-xs" 
                required 
              />
            </div>
          </div>

          <!-- Colaborador que lo realizó -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Colaborador Responsable <span class="text-error">*</span></span>
            </label>
            <select 
              v-model="form.colaboradorId" 
              class="select select-bordered select-sm w-full rounded-xl text-xs font-semibold"
              required
            >
              <option :value="null" disabled>-- Selecciona quién realizó el montaje --</option>
              <option v-for="c in colaboradores" :key="c.id" :value="c.id">
                👤 {{ c.nombre }}
              </option>
            </select>
          </div>

          <!-- Descripción del Montaje -->
          <div class="form-control">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Descripción del Trabajo Realizado <span class="text-error">*</span></span>
            </label>
            <textarea 
              v-model="form.descripcion" 
              rows="3" 
              placeholder="Detalla los materiales utilizados, requerimientos cumplidos o notas sobre el montaje..." 
              class="textarea textarea-bordered textarea-sm w-full rounded-xl text-xs leading-relaxed" 
              required
            ></textarea>
          </div>

          <!-- Foto Opcional de Evidencia -->
          <div class="form-control space-y-2">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Fotografía / Evidencia (Opcional)</span>
            </label>
            
            <div v-if="!previewUrl" class="flex items-center gap-2">
              <label class="btn btn-outline btn-sm text-xs font-bold gap-2 rounded-xl cursor-pointer">
                <Camera :size="15" />
                <span>Tomar Fotografía con Cámara</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  class="hidden" 
                  @change="alSeleccionarFoto" 
                />
              </label>
            </div>

            <div v-else class="flex items-center gap-3 p-2.5 rounded-2xl bg-base-200/50 border border-base-300">
              <img :src="previewUrl" alt="Preview" class="w-12 h-12 rounded-xl object-cover border border-base-300" />
              <div class="min-w-0 flex-1">
                <span class="text-xs font-bold text-base-content block truncate">Foto adjuntada</span>
                <button type="button" class="text-[11px] text-error font-bold hover:underline" @click="quitarFoto">
                  Eliminar foto
                </button>
              </div>
            </div>
          </div>

          <!-- Botones del Modal -->
          <div class="modal-action border-t border-base-200 pt-3 flex items-center justify-between">
            <button 
              type="button" 
              class="btn btn-ghost btn-sm font-bold rounded-xl" 
              @click="modalNuevoOpen = false"
              :disabled="guardando"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn btn-primary btn-sm font-black text-xs gap-2 rounded-xl shadow-sm"
              :disabled="guardando || !form.descripcion.trim()"
            >
              <span v-if="guardando" class="loading loading-spinner loading-xs"></span>
              <CheckCircle2 v-else :size="16" />
              <span>Guardar Registro</span>
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="modalNuevoOpen = false"><button>close</button></form>
    </dialog>

    <!-- Modal para ver foto en tamaño grande -->
    <dialog id="modal_foto_montaje_view" class="modal modal-bottom sm:modal-middle" :class="{'modal-open': modalFotoGrandeOpen}">
      <div class="modal-box p-3 bg-black/90 rounded-3xl max-w-2xl text-center">
        <img :src="fotoGrandeUrl || ''" alt="Foto Montaje" class="w-full h-auto max-h-[75vh] object-contain rounded-2xl" />
        <div class="modal-action justify-center mt-3">
          <button class="btn btn-sm btn-ghost text-white font-bold" @click="modalFotoGrandeOpen = false">
            Cerrar
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="modalFotoGrandeOpen = false"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Camera, 
  Eye, 
  Trash2, 
  CheckCircle2 
} from 'lucide-vue-next'
import { useMontajes, type Montaje } from '~/composables/useMontajes'

const props = defineProps<{
  proyectoId: number
  colaboradores?: any[]
}>()

const { cargando, montajes, cargarMontajesProyecto, crearMontaje, eliminarMontaje } = useMontajes()

const busqueda = ref('')
const filtroColaboradorId = ref<string | number>('todos')
const modalNuevoOpen = ref(false)
const modalFotoGrandeOpen = ref(false)
const fotoGrandeUrl = ref<string | null>(null)
const guardando = ref(false)
const archivoFoto = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = ref({
  titulo: '',
  descripcion: '',
  colaboradorId: null as number | null,
  fecha: '',
  hora: '',
  estado: 'completado'
})

function abrirModalNuevo() {
  const ahora = new Date()
  form.value = {
    titulo: 'Montaje',
    descripcion: '',
    colaboradorId: props.colaboradores?.length ? props.colaboradores[0].id : null,
    fecha: ahora.toISOString().split('T')[0],
    hora: ahora.toTimeString().split(' ')[0].substring(0, 5),
    estado: 'completado'
  }
  archivoFoto.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  modalNuevoOpen.value = true
}

function alSeleccionarFoto(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  archivoFoto.value = file
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

function quitarFoto() {
  archivoFoto.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

async function guardarMontaje() {
  if (!form.value.descripcion.trim()) return
  guardando.value = true
  try {
    await crearMontaje({
      proyectoId: props.proyectoId,
      colaboradorId: form.value.colaboradorId,
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      fecha: form.value.fecha,
      hora: form.value.hora,
      estado: form.value.estado,
      archivo: archivoFoto.value
    })
    modalNuevoOpen.value = false
  } catch (err) {
    console.error('Error al guardar montaje:', err)
  } finally {
    guardando.value = false
  }
}

async function confirmarEliminar(m: Montaje) {
  if (confirm(`¿Estás seguro de eliminar el registro de montaje "${m.titulo}"?`)) {
    await eliminarMontaje(m.id, props.proyectoId)
  }
}

function verFotoGrande(url: string) {
  fotoGrandeUrl.value = url
  modalFotoGrandeOpen.value = true
}

function obtenerNombreColaborador(m: Montaje) {
  if (m.colaborador_nombre && m.colaborador_nombre !== 'Sin asignar') {
    return m.colaborador_nombre
  }
  const colab = (props.colaboradores || []).find(c => c.id === m.colaborador_id)
  return colab ? colab.nombre : 'Colaborador'
}

function getEstadoBadgeClass(estado: string) {
  const e = (estado || '').toLowerCase()
  if (e === 'completado' || e === 'hecho') return 'badge-success text-white'
  if (e === 'en_proceso' || e === 'en proceso') return 'badge-warning text-warning-content'
  return 'badge-ghost text-base-content/70'
}

const montajesFiltrados = computed(() => {
  let list = montajes.value || []

  if (filtroColaboradorId.value !== 'todos') {
    list = list.filter(m => Number(m.colaborador_id) === Number(filtroColaboradorId.value))
  }

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase().trim()
    list = list.filter(m => 
      (m.titulo && m.titulo.toLowerCase().includes(q)) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (obtenerNombreColaborador(m).toLowerCase().includes(q))
    )
  }

  return list
})

watch(() => props.proyectoId, async (nuevoId) => {
  if (nuevoId) {
    await cargarMontajesProyecto(nuevoId)
  }
})

onMounted(async () => {
  if (props.proyectoId) {
    await cargarMontajesProyecto(props.proyectoId)
  }
})
</script>
