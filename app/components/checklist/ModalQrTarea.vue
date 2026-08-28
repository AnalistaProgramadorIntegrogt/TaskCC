<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-2xl rounded-3xl bg-base-100 p-0 shadow-2xl border border-base-200 overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header (Oculto al imprimir) -->
      <div class="p-5 sm:p-6 border-b border-base-200 bg-base-200/40 flex items-start justify-between gap-4 no-print">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-primary/10 text-primary rounded-xl">
              <QrCode :size="20" />
            </div>
            <h3 class="font-black text-lg sm:text-xl text-base-content leading-tight">
              {{ esLote ? `Códigos QR del Grupo (${tareas.length})` : 'Código QR de Tarea' }}
            </h3>
          </div>
          <p class="text-xs text-base-content/60 font-medium">
            {{ esLote 
              ? 'Etiquetas listas para imprimir y colocar en cada punto físico de trabajo.' 
              : 'Escanea esta etiqueta en el lugar de trabajo para registrar entrada y completar la tarea.' 
            }}
          </p>
        </div>

        <button 
          class="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content shrink-0" 
          @click="cerrar"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Contenido Principal -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow print-container">
        
        <!-- Vista Individual -->
        <div v-if="!esLote && tareaUnica" class="flex flex-col items-center space-y-4">
          <!-- Tarjeta de Etiqueta Imprimible -->
          <div 
            ref="printableCardRef"
            class="printable-sticker w-full max-w-sm bg-base-100 border-2 border-dashed border-base-300 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm relative overflow-hidden"
          >
            <!-- Badge Superior -->
            <div class="flex items-center justify-between w-full border-b border-base-200 pb-3">
              <div class="flex items-center gap-1.5 font-black text-xs text-primary">
                <CheckSquare :size="14" />
                <span>TaskCC</span>
              </div>
              <span class="badge badge-primary badge-outline badge-xs font-mono font-bold">
                ID #{{ tareaUnica.id }}
              </span>
            </div>

            <!-- Imagen QR -->
            <div class="p-3 bg-white rounded-2xl border border-base-200 shadow-inner flex items-center justify-center">
              <img 
                v-if="qrDataUrlUnica" 
                :src="qrDataUrlUnica" 
                :alt="tareaUnica.nombre"
                class="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
              <div v-else class="w-48 h-48 flex items-center justify-center">
                <span class="loading loading-spinner loading-md text-primary"></span>
              </div>
            </div>

            <!-- Información de la Tarea -->
            <div class="space-y-1 w-full">
              <h4 class="font-black text-base text-base-content leading-snug">
                {{ tareaUnica.nombre }}
              </h4>
              <p v-if="tareaUnica.descripcion" class="text-xs text-base-content/60 line-clamp-2">
                {{ tareaUnica.descripcion }}
              </p>
            </div>

            <!-- Footer Sticker -->
            <div class="w-full pt-3 border-t border-base-200 text-[10px] text-base-content/50 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
              <Smartphone :size="12" />
              <span>Escanea para registrar entrada y completar</span>
            </div>
          </div>

          <!-- Enlace Directo Copiable -->
          <div class="w-full max-w-sm space-y-1.5 no-print">
            <label class="text-[11px] font-bold text-base-content/60 uppercase">Enlace directo:</label>
            <div class="join w-full shadow-xs">
              <input 
                type="text" 
                readonly 
                :value="obtenerUrlTarea(tareaUnica.id)" 
                class="input input-sm join-item w-full bg-base-200 text-xs font-mono text-base-content/80 focus:outline-hidden"
              />
              <button 
                type="button" 
                class="btn btn-sm btn-primary join-item gap-1 font-bold text-xs"
                @click="copiarEnlace(obtenerUrlTarea(tareaUnica.id))"
              >
                <Copy :size="14" />
                <span>Copiar</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Vista Lote (Múltiples Tareas del Grupo) -->
        <div v-else-if="esLote" class="space-y-4">
          <div class="flex items-center justify-between no-print">
            <span class="text-xs font-bold text-base-content/70">
              {{ qrLoteList.length }} etiquetas generadas
            </span>
            <span class="text-[11px] text-base-content/50">
              Listo para impresión en cuadrícula
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="item in qrLoteList" 
              :key="item.tarea.id"
              class="printable-sticker bg-base-100 border border-base-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-xs relative"
            >
              <div class="flex items-center justify-between w-full border-b border-base-200 pb-2">
                <span class="font-black text-[11px] text-primary">TaskCC</span>
                <span class="badge badge-ghost badge-xs font-mono font-bold">#{{ item.tarea.id }}</span>
              </div>

              <div class="p-2 bg-white rounded-xl border border-base-200">
                <img 
                  v-if="item.dataUrl" 
                  :src="item.dataUrl" 
                  :alt="item.tarea.nombre"
                  class="w-32 h-32 object-contain"
                />
                <div v-else class="w-32 h-32 flex items-center justify-center">
                  <span class="loading loading-spinner loading-sm text-primary"></span>
                </div>
              </div>

              <div class="space-y-0.5 w-full">
                <h5 class="font-black text-xs text-base-content line-clamp-1">
                  {{ item.tarea.nombre }}
                </h5>
                <p class="text-[10px] text-base-content/50 line-clamp-1">
                  {{ item.tarea.descripcion || 'Escanea para registrar entrada' }}
                </p>
              </div>

              <div class="no-print pt-1 flex items-center gap-1 w-full justify-center">
                <button 
                  type="button" 
                  class="btn btn-ghost btn-xs text-primary gap-1 text-[11px] font-bold"
                  @click="copiarEnlace(obtenerUrlTarea(item.tarea.id))"
                >
                  <Copy :size="12" />
                  <span>Copiar Link</span>
                </button>
                <button 
                  type="button" 
                  class="btn btn-ghost btn-xs text-base-content/70 gap-1 text-[11px]"
                  @click="descargarQr(item.dataUrl, `QR_Tarea_${item.tarea.id}.png`)"
                >
                  <Download :size="12" />
                  <span>PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer / Acciones (Oculto al imprimir) -->
      <div class="p-4 sm:p-5 border-t border-base-200 bg-base-200/40 flex items-center justify-between gap-3 no-print">
        <button 
          type="button" 
          class="btn btn-ghost btn-sm font-bold rounded-xl" 
          @click="cerrar"
        >
          Cerrar
        </button>

        <div class="flex items-center gap-2">
          <button 
            v-if="!esLote && qrDataUrlUnica"
            type="button" 
            class="btn btn-ghost btn-sm font-bold rounded-xl gap-1.5"
            @click="descargarQr(qrDataUrlUnica, `QR_Tarea_${tareaUnica?.id}.png`)"
          >
            <Download :size="15" />
            <span>Descargar PNG</span>
          </button>

          <button 
            type="button" 
            class="btn btn-primary btn-sm sm:btn-md font-black rounded-2xl gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            @click="imprimir"
          >
            <Printer :size="16" />
            <span>{{ esLote ? 'Imprimir Todas las Etiquetas' : 'Imprimir Etiqueta' }}</span>
          </button>
        </div>
      </div>

    </div>
    <form method="dialog" class="modal-backdrop" @click="cerrar"><button>close</button></form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import QRCode from 'qrcode'
import {
  QrCode,
  X,
  Printer,
  Download,
  Copy,
  CheckSquare,
  Smartphone
} from 'lucide-vue-next'

export interface TareaQrItem {
  id: number | string
  nombre: string
  descripcion?: string | null
}

const props = defineProps<{
  isOpen: boolean
  tarea?: TareaQrItem | null
  tareas?: TareaQrItem[]
  nombreGrupo?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const printableCardRef = ref<HTMLElement | null>(null)
const qrDataUrlUnica = ref<string>('')
const qrLoteList = ref<{ tarea: TareaQrItem; dataUrl: string }[]>([])

const esLote = computed(() => {
  return Array.isArray(props.tareas) && props.tareas.length > 0
})

const tareaUnica = computed(() => {
  if (props.tarea) return props.tarea
  if (props.tareas && props.tareas.length === 1) return props.tareas[0]
  return null
})

function obtenerUrlTarea(id: number | string): string {
  if (typeof window === 'undefined') return ''
  const baseUrl = window.location.origin
  return `${baseUrl}/scan/tarea/${id}`
}

async function generarQr(texto: string): Promise<string> {
  try {
    return await QRCode.toDataURL(texto, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
  } catch (err) {
    console.error('Error generando código QR:', err)
    return ''
  }
}

async function cargarCodigosQr() {
  if (!props.isOpen) return

  if (esLote.value && props.tareas) {
    const list: { tarea: TareaQrItem; dataUrl: string }[] = []
    for (const t of props.tareas) {
      const url = obtenerUrlTarea(t.id)
      const dataUrl = await generarQr(url)
      list.push({ tarea: t, dataUrl })
    }
    qrLoteList.value = list
  } else if (tareaUnica.value) {
    const url = obtenerUrlTarea(tareaUnica.value.id)
    qrDataUrlUnica.value = await generarQr(url)
  }
}

watch(
  () => [props.isOpen, props.tarea, props.tareas],
  () => {
    if (props.isOpen) {
      cargarCodigosQr()
    } else {
      qrDataUrlUnica.value = ''
      qrLoteList.value = []
    }
  },
  { immediate: true }
)

function cerrar() {
  emit('cerrar')
}

function copiarEnlace(url: string) {
  if (!navigator?.clipboard) return
  navigator.clipboard.writeText(url)
  alert('¡Enlace copiado al portapapeles!')
}

function descargarQr(dataUrl: string, filename: string) {
  if (!dataUrl) return
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function imprimir() {
  window.print()
}
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .no-print {
    display: none !important;
  }
  .print-container,
  .print-container * {
    visibility: visible;
  }
  .print-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    background: white !important;
    color: black !important;
  }
  .printable-sticker {
    border: 2px solid #000 !important;
    box-shadow: none !important;
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 20px;
  }
}
</style>
