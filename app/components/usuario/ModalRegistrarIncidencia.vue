<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertTriangle, Camera, Image, Upload, X, Loader2, CheckCircle2 } from 'lucide-vue-next'
import { useIncidencias } from '~/composables/useIncidencias'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  colaboradorId: { type: Number, required: true },
  fechaDefecto: { type: String, default: null },
  proyectos: { type: Array as () => any[], default: () => [] }
})

const emit = defineEmits(['cerrar', 'guardada'])

const { crearIncidencia } = useIncidencias()

const guardando = ref(false)
const errorMensaje = ref('')
const archivoSeleccionado = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = ref({
  titulo: '',
  descripcion: '',
  proyectoId: null as number | null,
  fecha: '',
  hora: ''
})

function inicializarFormulario() {
  const ahora = new Date()
  const fechaHoy = ahora.toISOString().split('T')[0]
  const horaHoy = ahora.toTimeString().split(' ')[0].substring(0, 5)

  form.value = {
    titulo: '',
    descripcion: '',
    proyectoId: props.proyectos?.length ? props.proyectos[0].id : null,
    fecha: props.fechaDefecto || fechaHoy,
    hora: horaHoy
  }
  archivoSeleccionado.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  errorMensaje.value = ''
}

watch(() => props.isOpen, (nuevoValor) => {
  if (nuevoValor) {
    inicializarFormulario()
  }
})

function onArchivoSeleccionado(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  archivoSeleccionado.value = file
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
}

function eliminarArchivo() {
  archivoSeleccionado.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

async function guardar() {
  if (!form.value.titulo.trim()) {
    errorMensaje.value = 'El título de la incidencia es obligatorio.'
    return
  }

  guardando.value = true
  errorMensaje.value = ''

  try {
    const nuevaIncidencia = await crearIncidencia({
      colaboradorId: props.colaboradorId,
      proyectoId: form.value.proyectoId,
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      archivo: archivoSeleccionado.value,
      fecha: form.value.fecha,
      hora: form.value.hora
    })

    emit('guardada', nuevaIncidencia)
    emit('cerrar')
  } catch (err: any) {
    console.error('Error al guardar incidencia:', err)
    errorMensaje.value = err.message || 'Ocurrió un error al registrar la incidencia.'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-2xl bg-base-100 p-6 shadow-2xl border border-base-200 rounded-3xl">
      <!-- Modal Header -->
      <div class="flex items-start justify-between gap-3 pb-4 border-b border-base-200">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <AlertTriangle class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-xl font-black text-base-content leading-tight">
              Registrar Incidencia
            </h3>
            <p class="text-xs text-base-content/60 mt-0.5">
              Reporta cualquier problema, anomalía o evento imprevisto durante tus labores.
            </p>
          </div>
        </div>

        <button 
          class="btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-base-content" 
          @click="emit('cerrar')"
          :disabled="guardando"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Alert de Error si ocurre -->
      <div v-if="errorMensaje" class="alert alert-error text-xs shadow-sm mt-4 py-2.5">
        <AlertTriangle class="h-4 w-4" />
        <span>{{ errorMensaje }}</span>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar" class="space-y-4 mt-4">
        <!-- Título -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-bold text-xs">Título de la Incidencia <span class="text-error">*</span></span>
          </label>
          <input 
            type="text" 
            v-model="form.titulo" 
            placeholder="Ej. Fuga de agua en pasillo B, Falla eléctrica en bomba..." 
            class="input input-bordered w-full focus:input-warning text-sm rounded-xl"
            required
            :disabled="guardando"
          />
        </div>

        <!-- Fila de Proyecto, Fecha y Hora -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Proyecto -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Proyecto</span>
            </label>
            <select 
              v-model="form.proyectoId" 
              class="select select-bordered w-full text-xs rounded-xl focus:select-warning"
              :disabled="guardando || !proyectos?.length"
            >
              <option :value="null">-- General / Sin Proyecto --</option>
              <option v-for="p in proyectos" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Fecha -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Fecha</span>
            </label>
            <input 
              type="date" 
              v-model="form.fecha" 
              class="input input-bordered w-full text-xs rounded-xl focus:input-warning"
              required
              :disabled="guardando"
            />
          </div>

          <!-- Hora -->
          <div class="form-control w-full">
            <label class="label py-1">
              <span class="label-text font-bold text-xs">Hora de Registro</span>
            </label>
            <input 
              type="time" 
              v-model="form.hora" 
              class="input input-bordered w-full text-xs rounded-xl focus:input-warning"
              required
              :disabled="guardando"
            />
          </div>
        </div>

        <!-- Descripción -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text font-bold text-xs">Descripción Detallada</span>
          </label>
          <textarea 
            v-model="form.descripcion" 
            rows="3" 
            placeholder="Describe qué ocurrió, ubicación exacta y qué acciones se tomaron..." 
            class="textarea textarea-bordered w-full text-sm rounded-xl focus:textarea-warning"
            :disabled="guardando"
          ></textarea>
        </div>

        <!-- Imagen / Evidencia Fotográfica -->
        <div class="form-control w-full space-y-2">
          <label class="label py-1">
            <span class="label-text font-bold text-xs">Fotografía / Evidencia de la Incidencia</span>
          </label>

          <div v-if="!previewUrl" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <!-- Botón Cámara -->
            <label class="btn btn-outline border-base-300 hover:border-warning hover:bg-warning/10 hover:text-warning text-xs font-bold gap-2 rounded-xl h-12 cursor-pointer transition-all">
              <Camera :size="18" />
              <span>Tomar Fotografía</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                class="hidden" 
                @change="onArchivoSeleccionado" 
                :disabled="guardando"
              />
            </label>

            <!-- Botón Galería -->
            <label class="btn btn-outline border-base-300 hover:border-warning hover:bg-warning/10 hover:text-warning text-xs font-bold gap-2 rounded-xl h-12 cursor-pointer transition-all">
              <Image :size="18" />
              <span>Seleccionar de Galería</span>
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="onArchivoSeleccionado" 
                :disabled="guardando"
              />
            </label>
          </div>

          <!-- Previsualización si ya seleccionó archivo -->
          <div v-else class="relative rounded-2xl border border-warning/40 bg-warning/5 p-3 flex items-center gap-4">
            <img 
              :src="previewUrl" 
              alt="Previsualización" 
              class="h-20 w-24 rounded-xl object-cover border border-base-300 shadow-xs flex-shrink-0"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-extrabold text-base-content truncate">
                {{ archivoSeleccionado?.name }}
              </p>
              <p class="text-[11px] text-base-content/60 mt-0.5">
                {{ (archivoSeleccionado?.size ? (archivoSeleccionado.size / 1024 / 1024).toFixed(2) : 0) }} MB
              </p>
              <span class="badge badge-warning badge-xs font-bold text-[10px] mt-1">
                Foto adjunta lista
              </span>
            </div>
            <button 
              type="button" 
              class="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10" 
              @click="eliminarArchivo"
              :disabled="guardando"
              title="Quitar imagen"
            >
              <X :size="16" />
            </button>
          </div>
        </div>

        <!-- Acciones del Modal -->
        <div class="modal-action pt-4 border-t border-base-200 flex justify-between items-center">
          <button 
            type="button" 
            class="btn btn-ghost btn-sm rounded-xl font-bold text-xs" 
            @click="emit('cerrar')"
            :disabled="guardando"
          >
            Cancelar
          </button>
          
          <button 
            type="submit" 
            class="btn btn-warning text-warning-content btn-sm rounded-xl font-extrabold text-xs gap-2 min-w-[140px] shadow-sm"
            :disabled="guardando || !form.titulo.trim()"
          >
            <Loader2 v-if="guardando" class="h-4 w-4 animate-spin" />
            <CheckCircle2 v-else class="h-4 w-4" />
            <span>{{ guardando ? 'Guardando...' : 'Guardar Incidencia' }}</span>
          </button>
        </div>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop" @click="emit('cerrar')">
      <button>cerrar</button>
    </form>
  </dialog>
</template>
