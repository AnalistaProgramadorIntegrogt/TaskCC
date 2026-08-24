<template>
  <div v-if="isOpen" class="modal modal-open bg-black/70 backdrop-blur-sm z-50 p-2 sm:p-4">
    <div class="modal-box max-w-3xl rounded-3xl bg-base-100 p-0 shadow-2xl border border-base-200 overflow-hidden flex flex-col max-h-[92vh]">
      
      <!-- Encabezado del Modal -->
      <div class="p-5 sm:p-6 border-b border-base-200 bg-base-200/40 flex items-start justify-between gap-4">
        <div class="space-y-1 min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge badge-primary badge-sm font-bold">
              {{ tarea?.proyecto_nombre || 'Proyecto General' }}
            </span>
            <span v-if="tarea?.grupo_nombre" class="badge badge-ghost badge-sm font-medium">
              📁 {{ tarea.grupo_nombre }}
            </span>
            <span 
              class="badge badge-sm font-black"
              :class="tarea?.auditada ? 'badge-success text-white' : 'badge-warning text-warning-content'"
            >
              {{ tarea?.auditada ? '✓ Revisada' : '⏳ Pendiente de Revisión' }}
            </span>
          </div>

          <h3 class="text-xl sm:text-2xl font-black text-base-content leading-tight break-words pt-1">
            {{ tarea?.tarea_nombre }}
          </h3>
        </div>

        <button 
          class="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content shrink-0" 
          @click="cerrar"
          :disabled="guardando"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Contenido scrolleable -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow">
        
        <!-- Ficha de Datos: Quién la hizo y a qué hora -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-4 rounded-2xl border border-base-200">
          <!-- Quién la hizo -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
              {{ getIniciales(tarea?.colaborador_resuelve_nombre || tarea?.colaborador_asignado_nombre) }}
            </div>
            <div class="min-w-0">
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-base-content/50 block">
                Realizada Por
              </span>
              <span class="font-bold text-sm text-base-content truncate block">
                {{ tarea?.colaborador_resuelve_nombre || tarea?.colaborador_asignado_nombre }}
              </span>
              <span v-if="tarea?.colaborador_asignado_nombre && tarea.colaborador_resuelve_nombre && tarea.colaborador_asignado_nombre !== tarea.colaborador_resuelve_nombre" class="text-[11px] text-base-content/60 block">
                Asignada a: {{ tarea.colaborador_asignado_nombre }}
              </span>
            </div>
          </div>

          <!-- Fecha y Hora de Realización -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <Clock :size="20" />
            </div>
            <div class="min-w-0">
              <span class="text-[10px] uppercase tracking-wider font-extrabold text-base-content/50 block">
                Fecha y Hora de Completado
              </span>
              <span class="font-bold text-sm text-base-content block">
                {{ formatearFechaHora(tarea?.completada_at) }}
              </span>
              <span class="text-[11px] text-base-content/60 block">
                Fecha del checklist: {{ tarea?.fecha }} ({{ tarea?.dia }})
              </span>
            </div>
          </div>
        </div>

        <!-- Evidencia Fotográfica y Descripción -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Columna 1: Imagen de Evidencia -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <Camera :size="14" class="text-primary" />
                <span>Evidencia Fotográfica</span>
              </label>

              <a 
                v-if="tarea?.foto_url" 
                :href="tarea.foto_url" 
                target="_blank" 
                class="btn btn-ghost btn-xs text-primary gap-1 font-bold text-xs"
                title="Abrir imagen en pestaña nueva"
              >
                <ExternalLink :size="12" />
                <span>Ver Original</span>
              </a>
            </div>

            <div class="relative rounded-2xl overflow-hidden border border-base-200 bg-base-300/30 flex items-center justify-center aspect-video min-h-[220px]">
              <img 
                v-if="tarea?.foto_url" 
                :src="tarea.foto_url" 
                alt="Evidencia fotográfica de la tarea" 
                class="w-full h-full object-contain max-h-[300px]"
                loading="lazy"
              />
              <div v-else class="text-center p-6 text-base-content/40 space-y-1">
                <Camera :size="36" class="mx-auto opacity-30" />
                <p class="text-xs font-semibold">Sin evidencia fotográfica registrada</p>
              </div>
            </div>
          </div>

          <!-- Columna 2: Descripción y Observaciones de la Tarea -->
          <div class="space-y-4 flex flex-col">
            <!-- Observaciones / Comentario de realización -->
            <div class="space-y-1 flex-1">
              <label class="text-xs font-black uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                <FileText :size="14" class="text-secondary" />
                <span>Descripción / Comentario al Completar</span>
              </label>
              <div class="p-3.5 rounded-2xl bg-base-200/60 border border-base-200 min-h-[80px] text-xs text-base-content/90 whitespace-pre-wrap leading-relaxed">
                {{ tarea?.observaciones || 'No se registraron comentarios al momento de completar la tarea.' }}
              </div>
            </div>

            <!-- Descripción original de la tarea si existe -->
            <div v-if="tarea?.tarea_descripcion" class="space-y-1">
              <label class="text-xs font-bold text-base-content/60">
                Instrucciones / Descripción de la Tarea
              </label>
              <div class="p-3 rounded-xl bg-base-200/30 border border-base-200/60 text-xs text-base-content/70">
                {{ tarea.tarea_descripcion }}
              </div>
            </div>

            <!-- Info de Auditoría previa si existe -->
            <div v-if="tarea?.auditada && tarea.auditado_at" class="p-3 rounded-2xl bg-success/10 border border-success/20 text-xs text-success-content space-y-1">
              <div class="font-bold flex items-center gap-1 text-success">
                <CheckCircle2 :size="14" />
                <span>Revisión registrada</span>
              </div>
              <p class="text-[11px] text-base-content/80">
                Evaluada por <strong>{{ tarea.auditor_nombre || 'Auditor' }}</strong> el {{ formatearFechaHora(tarea.auditado_at) }}.
              </p>
            </div>
          </div>
        </div>

        <div class="divider my-0 text-xs uppercase tracking-wider font-extrabold text-base-content/40">
          Evaluación y Calificación de Auditoría
        </div>

        <!-- Formulario de Calificación (1 al 10) -->
        <div class="space-y-4 bg-base-100 p-5 rounded-3xl border-2 border-primary/20 shadow-xs">
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
              <label class="text-sm font-black text-base-content flex items-center gap-2">
                <Star :size="18" class="text-warning fill-warning" />
                <span>Puntaje de Ejecución (1 al 10):</span>
              </label>

              <!-- Indicador de nivel de calidad -->
              <span 
                v-if="puntajeSeleccionado > 0"
                class="badge badge-lg font-black text-xs px-3 py-1 shadow-xs"
                :class="getScoreBadgeClass(puntajeSeleccionado)"
              >
                {{ puntajeSeleccionado }}/10 • {{ getScoreText(puntajeSeleccionado) }}
              </span>
              <span v-else class="text-xs text-base-content/50 italic">
                Selecciona un puntaje
              </span>
            </div>

            <!-- Selector de Calificación 1 a 10 con Botones -->
            <div class="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
              <button
                v-for="p in 10"
                :key="p"
                type="button"
                class="btn btn-sm sm:btn-md font-black text-sm rounded-2xl transition-all duration-200"
                :class="[
                  puntajeSeleccionado === p
                    ? getBotonActivoClass(p) + ' scale-105 shadow-md ring-2 ring-offset-2 ring-primary'
                    : 'btn-ghost bg-base-200/80 hover:bg-base-300 text-base-content'
                ]"
                @click="puntajeSeleccionado = p"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Comentario / Justificación de la Calificación -->
          <div class="form-control w-full space-y-1.5">
            <label class="label py-0">
              <span class="label-text text-xs font-black text-base-content flex items-center gap-1.5">
                <MessageSquare :size="14" class="text-primary" />
                <span>Comentario o justificación de la calificación:</span>
              </span>
              <span class="label-text-alt text-[10px] text-base-content/50">
                {{ comentarioAuditoria.length }} caracteres
              </span>
            </label>
            <textarea
              v-model="comentarioAuditoria"
              placeholder="Explica qué aspectos estuvieron bien realizados o qué detalles requieren corrección o mejora..."
              class="textarea textarea-bordered textarea-md w-full text-xs sm:text-sm rounded-2xl focus:textarea-primary h-24 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

      </div>

      <!-- Footer / Acciones del Modal -->
      <div class="p-4 sm:p-5 border-t border-base-200 bg-base-200/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
        <div>
          <button 
            v-if="tarea?.auditada"
            type="button" 
            class="btn btn-ghost btn-sm text-error hover:bg-error/10 font-bold text-xs gap-1"
            @click="confirmarReinicioAuditoria"
            :disabled="guardando"
          >
            <RotateCcw :size="14" />
            <span>Restablecer a Pendiente</span>
          </button>
        </div>

        <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button 
            type="button" 
            class="btn btn-ghost btn-sm font-bold rounded-xl"
            @click="cerrar"
            :disabled="guardando"
          >
            Cancelar
          </button>
          
          <button 
            type="button" 
            class="btn btn-primary btn-sm sm:btn-md font-black rounded-2xl gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all min-w-[150px]"
            :disabled="guardando || puntajeSeleccionado === 0"
            @click="guardar"
          >
            <span v-if="guardando" class="loading loading-spinner loading-sm"></span>
            <template v-else>
              <CheckCircle2 :size="18" />
              <span>{{ tarea?.auditada ? 'Actualizar Calificación' : 'Guardar Calificación' }}</span>
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  Camera,
  Clock,
  ExternalLink,
  Star,
  MessageSquare,
  CheckCircle2,
  FileText,
  RotateCcw
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TareaAuditada } from '~/composables/useAuditoria'
import { useAuditoria } from '~/composables/useAuditoria'

const props = defineProps<{
  isOpen: boolean
  tarea: TareaAuditada | null
  auditorId: number | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'guardada', tareaActualizada: TareaAuditada): void
}>()

const { guardarAuditoria, eliminarAuditoria, getScoreBadgeClass, getScoreText } = useAuditoria()

const puntajeSeleccionado = ref<number>(0)
const comentarioAuditoria = ref<string>('')
const guardando = ref(false)

// Sincronizar campos cuando se abre o cambia la tarea
watch(
  () => props.tarea,
  (nuevaTarea) => {
    if (nuevaTarea) {
      puntajeSeleccionado.value = nuevaTarea.auditoria_puntaje || 0
      comentarioAuditoria.value = nuevaTarea.auditoria_comentario || ''
    } else {
      puntajeSeleccionado.value = 0
      comentarioAuditoria.value = ''
    }
  },
  { immediate: true }
)

function cerrar() {
  if (guardando.value) return
  emit('cerrar')
}

function getIniciales(nombre?: string | null): string {
  if (!nombre) return 'U'
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.slice(0, 2).toUpperCase()
}

function formatearFechaHora(fechaIso?: string | null): string {
  if (!fechaIso) return 'Fecha no registrada'
  try {
    const d = typeof fechaIso === 'string' ? parseISO(fechaIso) : new Date(fechaIso)
    return format(d, "EEEE d 'de' MMMM, yyyy - hh:mm a", { locale: es })
  } catch {
    return fechaIso
  }
}

function getBotonActivoClass(puntaje: number): string {
  if (puntaje >= 9) return 'bg-emerald-500 text-white border-emerald-600'
  if (puntaje >= 7) return 'bg-blue-500 text-white border-blue-600'
  if (puntaje >= 5) return 'bg-amber-500 text-white border-amber-600'
  return 'bg-rose-500 text-white border-rose-600'
}

async function guardar() {
  if (!props.tarea || puntajeSeleccionado.value === 0 || !props.auditorId) {
    return
  }

  guardando.value = true
  try {
    await guardarAuditoria(props.tarea.id, {
      puntaje: puntajeSeleccionado.value,
      comentario: comentarioAuditoria.value,
      auditorId: props.auditorId
    })

    const tareaActualizada: TareaAuditada = {
      ...props.tarea,
      auditada: true,
      auditoria_puntaje: puntajeSeleccionado.value,
      auditoria_comentario: comentarioAuditoria.value,
      auditado_por_id: props.auditorId,
      auditado_at: new Date().toISOString()
    }

    emit('guardada', tareaActualizada)
    cerrar()
  } catch (err: any) {
    alert(err.message || 'Error al guardar la auditoría')
  } finally {
    guardando.value = false
  }
}

async function confirmarReinicioAuditoria() {
  if (!props.tarea) return
  if (!confirm('¿Estás seguro de que deseas restablecer esta tarea a estado "Pendiente de revisión"?')) {
    return
  }

  guardando.value = true
  try {
    await eliminarAuditoria(props.tarea.id)
    const tareaActualizada: TareaAuditada = {
      ...props.tarea,
      auditada: false,
      auditoria_puntaje: null,
      auditoria_comentario: null,
      auditado_por_id: null,
      auditor_nombre: null,
      auditado_at: null
    }
    emit('guardada', tareaActualizada)
    cerrar()
  } catch (err: any) {
    alert(err.message || 'Error al restablecer la auditoría')
  } finally {
    guardando.value = false
  }
}
</script>
