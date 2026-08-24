<script setup lang="ts">
import { ref } from 'vue'
import { Camera, RefreshCw, CheckCircle2, X, FileText } from 'lucide-vue-next'

const emit = defineEmits(['confirmar', 'cancelar'])

const previsualizacion = ref<string | null>(null)
const archivoSeleccionado = ref<File | null>(null)
const observaciones = ref('')
const inputCamara = ref<HTMLInputElement | null>(null)

function alSeleccionarArchivo(e: Event) {
  const target = e.target as HTMLInputElement
  const archivo = target.files?.[0]
  if (!archivo) return
  archivoSeleccionado.value = archivo
  if (previsualizacion.value) {
    URL.revokeObjectURL(previsualizacion.value)
  }
  previsualizacion.value = URL.createObjectURL(archivo)
}

function reabrirCamara() {
  archivoSeleccionado.value = null
  if (previsualizacion.value) {
    URL.revokeObjectURL(previsualizacion.value)
    previsualizacion.value = null
  }
  if (inputCamara.value) {
    inputCamara.value.value = ''
    inputCamara.value.click()
  }
}

function confirmar() {
  if (archivoSeleccionado.value) {
    emit('confirmar', archivoSeleccionado.value, observaciones.value)
  }
}

function cancelar() {
  if (previsualizacion.value) {
    URL.revokeObjectURL(previsualizacion.value)
  }
  emit('cancelar')
}
</script>

<template>
  <div class="modal modal-open bg-black/60 backdrop-blur-xs z-50">
    <div class="modal-box max-w-md rounded-3xl bg-base-100 p-6 shadow-2xl border border-base-200">
      <!-- Encabezado -->
      <div class="flex items-center justify-between pb-3 border-b border-base-200">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-2xl bg-primary/10 text-primary">
            <Camera :size="20" />
          </div>
          <div>
            <h3 class="text-base font-bold text-base-content leading-tight">
              Evidencia Fotográfica
            </h3>
            <p class="text-[11px] text-base-content/60 font-medium">
              Fotografía en tiempo real requerida
            </p>
          </div>
        </div>
        <button 
          class="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content" 
          @click="cancelar"
        >
          <X :size="16" />
        </button>
      </div>

      <div class="py-4 space-y-4">
        <!-- Input de cámara oculto (exclusivo para cámara en vivo) -->
        <input 
          ref="inputCamara"
          type="file" 
          accept="image/*" 
          capture="environment" 
          class="hidden" 
          @change="alSeleccionarArchivo"
        >

        <!-- Estado 1: Antes de tomar foto -->
        <div v-if="!previsualizacion" class="flex flex-col items-center justify-center p-6 border-2 border-dashed border-base-300 rounded-2xl bg-base-200/30 text-center space-y-3">
          <div class="p-3 bg-primary/10 text-primary rounded-full">
            <Camera :size="32" />
          </div>
          <div class="space-y-1">
            <p class="text-xs font-bold text-base-content">
              Toma una fotografía con la cámara
            </p>
            <p class="text-[11px] text-base-content/60 max-w-xs">
              Para confirmar que la tarea ha sido completada correctamente.
            </p>
          </div>

          <label class="btn btn-primary btn-sm font-bold gap-2 rounded-xl px-5 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Camera :size="16" />
            <span>Abrir Cámara</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              class="hidden" 
              @change="alSeleccionarArchivo"
            >
          </label>
        </div>

        <!-- Estado 2: Foto tomada / Previsualización -->
        <div v-else class="space-y-3">
          <div class="relative overflow-hidden rounded-2xl border border-base-300 bg-base-300/30 flex items-center justify-center max-h-56">
            <img 
              :src="previsualizacion" 
              alt="Previsualización de evidencia" 
              class="w-full h-auto max-h-56 object-contain"
            >
            <div class="absolute top-2 right-2 badge badge-success text-success-content font-bold text-[10px] gap-1 shadow-sm">
              <CheckCircle2 :size="12" />
              <span>Foto capturada</span>
            </div>
          </div>

          <div class="flex justify-center">
            <button 
              type="button" 
              class="btn btn-ghost btn-xs font-bold text-xs gap-1.5 text-base-content/70 hover:text-base-content"
              @click="reabrirCamara"
            >
              <RefreshCw :size="12" />
              <span>Volver a tomar foto</span>
            </button>
          </div>

          <!-- Campo opcional de Descripción / Observaciones -->
          <div class="form-control w-full pt-1">
            <label class="label py-1">
              <span class="label-text text-xs font-bold flex items-center gap-1.5 text-base-content/80">
                <FileText :size="13" class="text-primary" />
                <span>Descripción o comentario de realización (opcional)</span>
              </span>
            </label>
            <textarea 
              v-model="observaciones"
              placeholder="Ej: Se limpió y sanitizó toda el área según el protocolo..."
              class="textarea textarea-bordered textarea-sm w-full text-xs rounded-xl focus:textarea-primary h-16 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="modal-action border-t border-base-200 pt-3 mt-0 flex items-center justify-between">
        <button class="btn btn-ghost btn-sm font-bold rounded-xl" @click="cancelar">
          Cancelar
        </button>
        <button 
          class="btn btn-primary btn-sm font-bold rounded-xl gap-2 shadow-sm" 
          :disabled="!archivoSeleccionado" 
          @click="confirmar"
        >
          <CheckCircle2 :size="16" />
          <span>Confirmar Tarea</span>
        </button>
      </div>
    </div>
  </div>
</template>
