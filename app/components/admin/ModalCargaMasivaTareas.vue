<template>
  <dialog class="modal modal-bottom sm:modal-middle" :class="{ 'modal-open': isOpen }">
    <div class="modal-box max-w-3xl rounded-3xl bg-base-100 p-0 shadow-2xl border border-base-200 overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="p-5 sm:p-6 border-b border-base-200 bg-base-200/40 flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <FileSpreadsheet :size="20" />
            </div>
            <h3 class="font-black text-lg sm:text-xl text-base-content leading-tight">
              Carga Masiva de Tareas desde Excel
            </h3>
          </div>
          <p class="text-xs text-base-content/60 font-medium">
            Sube un archivo Excel (.xlsx, .xls) con las columnas <strong>Titulo</strong> y <strong>Descripcion</strong> para crear o actualizar tareas automáticamente.
          </p>
        </div>

        <button 
          class="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content shrink-0" 
          @click="cerrar"
          :disabled="procesando"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Contenido Principal -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">
        
        <!-- Barra de Descarga de Plantilla Guía -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-2xl">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Download :size="18" />
            </div>
            <div>
              <h4 class="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                ¿Necesitas la plantilla base?
              </h4>
              <p class="text-[11px] text-emerald-800/80 dark:text-emerald-300/70">
                Descarga la plantilla con las tareas actuales para editarlas o añadir nuevas filas.
              </p>
            </div>
          </div>

          <button 
            type="button" 
            class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs gap-1.5 border-none shadow-xs shrink-0"
            @click="emit('descargar-plantilla')"
          >
            <Download :size="14" />
            <span>Descargar Plantilla</span>
          </button>
        </div>

        <!-- Estado 1: Zona de Arrastre / Carga de Archivo (Si no se ha cargado archivo aún) -->
        <div 
          v-if="!archivoCargado"
          class="border-2 border-dashed border-base-300 hover:border-primary/60 rounded-3xl p-8 bg-base-200/30 hover:bg-base-200/50 transition-all text-center space-y-4 cursor-pointer relative"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="onDrop"
          :class="{ 'border-primary bg-primary/5': dragOver }"
        >
          <input 
            type="file" 
            ref="fileInputRef" 
            accept=".xlsx, .xls, .csv" 
            class="hidden" 
            @change="onFileSelected"
          />

          <div class="p-4 bg-primary/10 text-primary rounded-full inline-flex">
            <UploadCloud :size="36" />
          </div>

          <div class="space-y-1">
            <h4 class="font-black text-base text-base-content">
              Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
            </h4>
            <p class="text-xs text-base-content/60 max-w-sm mx-auto">
              Formatos soportados: <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong>.
              Asegúrate de que tenga las columnas <strong>Titulo</strong> y <strong>Descripcion</strong>.
            </p>
          </div>

          <button 
            type="button" 
            class="btn btn-primary btn-sm font-bold rounded-2xl gap-2 shadow-xs px-6"
            @click="fileInputRef?.click()"
          >
            <FileSpreadsheet :size="16" />
            <span>Seleccionar Archivo</span>
          </button>
        </div>

        <!-- Estado 2: Archivo Cargado y Previsualización de Datos -->
        <div v-else class="space-y-4">
          <!-- Resumen del Archivo -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-base-200/60 rounded-2xl border border-base-200">
            <div class="flex items-center gap-3 min-w-0">
              <div class="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                <FileSpreadsheet :size="22" />
              </div>
              <div class="min-w-0">
                <div class="font-extrabold text-sm text-base-content truncate">{{ nombreArchivo }}</div>
                <div class="text-[11px] text-base-content/60 flex items-center gap-2 mt-0.5">
                  <span class="badge badge-success badge-xs font-bold text-white">
                    {{ resultadoParseo.tareas.length }} tareas válidas
                  </span>
                  <span v-if="resultadoParseo.filasIgnoradas > 0" class="badge badge-ghost badge-xs">
                    {{ resultadoParseo.filasIgnoradas }} filas vacías ignoradas
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              class="btn btn-ghost btn-xs font-bold text-xs text-error hover:bg-error/10 gap-1 rounded-xl"
              @click="limpiarArchivo"
              :disabled="procesando"
            >
              <Trash2 :size="13" />
              <span>Cambiar Archivo</span>
            </button>
          </div>

          <!-- Selector de Grupo Destino Opcional -->
          <div v-if="gruposDisponibles && gruposDisponibles.length > 0" class="form-control w-full bg-base-200/40 p-4 rounded-2xl border border-base-200">
            <label class="label py-0 mb-1">
              <span class="label-text text-xs font-black text-base-content flex items-center gap-1.5">
                <FolderPlus :size="14" class="text-primary" />
                <span>Asignar automáticamente a un grupo (Opcional):</span>
              </span>
            </label>
            <select 
              v-model="grupoDestinoSeleccionado" 
              class="select select-bordered select-sm w-full rounded-xl text-xs focus:select-primary"
              :disabled="procesando"
            >
              <option :value="null">-- Solo registrar en el catálogo de tareas (sin asignar a grupo) --</option>
              <option v-for="g in gruposDisponibles" :key="g.id" :value="g.id">
                📁 {{ g.nombre }} ({{ g.es_predeterminado ? 'Por Defecto' : 'Grupo' }})
              </option>
            </select>
          </div>

          <!-- Alertas de Errores de Validación si existen -->
          <div v-if="resultadoParseo.errores.length > 0" class="alert alert-warning text-xs p-3 rounded-2xl shadow-xs">
            <AlertCircle :size="18" />
            <div>
              <span class="font-bold">Aviso en algunas filas:</span>
              <ul class="list-disc list-inside mt-1 space-y-0.5">
                <li v-for="(err, idx) in resultadoParseo.errores.slice(0, 3)" :key="idx">{{ err }}</li>
                <li v-if="resultadoParseo.errores.length > 3">...y {{ resultadoParseo.errores.length - 3 }} advertencias más.</li>
              </ul>
            </div>
          </div>

          <!-- Tabla de Previsualización -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black uppercase tracking-wider text-base-content/60 px-1">
              <span>Vista Previa de Tareas ({{ resultadoParseo.tareas.length }})</span>
              <span>Columnas: Titulo | Descripcion</span>
            </div>

            <div class="max-h-60 overflow-y-auto rounded-2xl border border-base-200 bg-base-100">
              <table class="table table-xs table-zebra w-full">
                <thead>
                  <tr class="bg-base-200 text-[10px] uppercase font-bold text-base-content/70">
                    <th class="w-10 text-center">#</th>
                    <th class="w-2/5">Título de la Tarea</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(t, index) in resultadoParseo.tareas" :key="index">
                    <td class="text-center font-mono text-[10px] text-base-content/50">{{ index + 1 }}</td>
                    <td class="font-bold text-base-content text-xs">{{ t.nombre }}</td>
                    <td class="text-xs text-base-content/70 whitespace-pre-wrap">{{ t.descripcion || '(Sin descripción)' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer / Acciones -->
      <div class="p-4 sm:p-5 border-t border-base-200 bg-base-200/40 flex items-center justify-between gap-3">
        <button 
          type="button" 
          class="btn btn-ghost btn-sm font-bold rounded-xl" 
          @click="cerrar"
          :disabled="procesando"
        >
          Cancelar
        </button>

        <div class="flex items-center gap-2">
          <button 
            v-if="archivoCargado"
            type="button" 
            class="btn btn-primary btn-sm sm:btn-md font-black rounded-2xl gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            :disabled="procesando || resultadoParseo.tareas.length === 0"
            @click="confirmarImportacion"
          >
            <span v-if="procesando" class="loading loading-spinner loading-sm"></span>
            <template v-else>
              <CheckCircle2 :size="16" />
              <span>Importar {{ resultadoParseo.tareas.length }} Tareas</span>
            </template>
          </button>
        </div>
      </div>

    </div>
    <form method="dialog" class="modal-backdrop" @click="cerrar"><button>close</button></form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  Trash2,
  FolderPlus,
  AlertCircle,
  CheckCircle2
} from 'lucide-vue-next'
import { useExcelTareas, type ResultadoParseoExcel } from '~/composables/useExcelTareas'

const props = defineProps<{
  isOpen: boolean
  gruposDisponibles?: any[]
  grupoSeleccionadoId?: number | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'descargar-plantilla'): void
  (e: 'importacion-completada', resultado: { creadas: number; actualizadas: number; asociadasAlGrupo: number }): void
}>()

const { leerArchivoExcel, importarTareasMasivas, procesando } = useExcelTareas()

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const archivoCargado = ref(false)
const nombreArchivo = ref('')
const grupoDestinoSeleccionado = ref<number | null>(props.grupoSeleccionadoId || null)

const resultadoParseo = ref<ResultadoParseoExcel>({
  tareas: [],
  totalFilas: 0,
  filasIgnoradas: 0,
  errores: []
})

watch(
  () => props.grupoSeleccionadoId,
  (val) => {
    grupoDestinoSeleccionado.value = val || null
  }
)

function cerrar() {
  if (procesando.value) return
  limpiarArchivo()
  emit('cerrar')
}

function limpiarArchivo() {
  archivoCargado.value = false
  nombreArchivo.value = ''
  resultadoParseo.value = {
    tareas: [],
    totalFilas: 0,
    filasIgnoradas: 0,
    errores: []
  }
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function procesarArchivo(file: File) {
  try {
    nombreArchivo.value = file.name
    const res = await leerArchivoExcel(file)
    resultadoParseo.value = res
    archivoCargado.value = true
  } catch (err: any) {
    alert(err.message || 'Error al procesar el archivo Excel.')
    limpiarArchivo()
  }
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    procesarArchivo(file)
  }
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    procesarArchivo(file)
  }
}

async function confirmarImportacion() {
  if (resultadoParseo.value.tareas.length === 0) return

  try {
    const res = await importarTareasMasivas({
      tareas: resultadoParseo.value.tareas,
      grupoId: grupoDestinoSeleccionado.value
    })

    emit('importacion-completada', res)
    cerrar()
  } catch (err: any) {
    alert(err.message || 'Error durante la importación masiva.')
  }
}
</script>
