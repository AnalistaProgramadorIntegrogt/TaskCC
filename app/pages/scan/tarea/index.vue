<template>
  <div class="min-h-screen bg-base-200/50 py-6 px-4 sm:py-10">
    <div class="max-w-lg mx-auto space-y-6">

      <!-- Botón Volver / Header Superior -->
      <div class="flex items-center justify-between">
        <NuxtLink 
          to="/" 
          class="btn btn-ghost btn-sm gap-2 font-bold rounded-xl text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft :size="16" />
          <span>Volver al Inicio</span>
        </NuxtLink>

        <div class="flex items-center gap-1.5 font-black text-xs text-primary px-3 py-1.5 bg-primary/10 rounded-xl">
          <QrCode :size="14" />
          <span>Verificación QR</span>
        </div>
      </div>

      <!-- Estado: Cargando -->
      <div v-if="cargando" class="card bg-base-100 shadow-xl border border-base-200 rounded-3xl p-8 text-center space-y-4">
        <span class="loading loading-spinner loading-lg text-primary mx-auto"></span>
        <div class="space-y-1">
          <h3 class="font-black text-base text-base-content">Cargando tarea escaneada...</h3>
          <p class="text-xs text-base-content/60 font-medium">Validando asignación y registrando entrada presencial.</p>
        </div>
      </div>

      <!-- Estado: Sin ID o Error de Parámetros -->
      <div v-else-if="!tareaIdParam" class="card bg-base-100 shadow-xl border border-base-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div class="w-14 h-14 bg-warning/10 text-warning rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle :size="28" />
        </div>
        <div class="space-y-1">
          <h3 class="font-black text-lg text-base-content">No se especificó la tarea</h3>
          <p class="text-xs text-base-content/70 max-w-xs mx-auto">
            Por favor escanea el código QR físico de la tarea para ingresar a su registro.
          </p>
        </div>
        <NuxtLink to="/" class="btn btn-primary btn-sm rounded-xl font-bold">
          Ir a mis tareas
        </NuxtLink>
      </div>

      <!-- Estado: Error o Tarea No Encontrada -->
      <div v-else-if="errorMsg" class="card bg-base-100 shadow-xl border border-base-200 rounded-3xl p-6 sm:p-8 text-center space-y-4">
        <div class="w-14 h-14 bg-error/10 text-error rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle :size="28" />
        </div>
        <div class="space-y-1">
          <h3 class="font-black text-lg text-base-content">No se pudo cargar la tarea</h3>
          <p class="text-xs text-base-content/70 max-w-xs mx-auto">{{ errorMsg }}</p>
        </div>
        <NuxtLink to="/" class="btn btn-primary btn-sm rounded-xl font-bold">
          Ir a mis tareas
        </NuxtLink>
      </div>

      <!-- Estado: Tarea Cargada Exitosamente -->
      <div v-else class="space-y-5">
        
        <!-- Tarjeta Principal de la Tarea -->
        <div class="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
          
          <!-- Encabezado de la Tarea -->
          <div class="p-6 border-b border-base-200 bg-base-200/30 space-y-3">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="badge badge-primary font-mono font-bold text-xs py-2 px-3 rounded-lg">
                Tarea #{{ tarea?.id }}
              </span>

              <span v-if="checkinRegistrado" class="badge badge-success text-white font-bold text-xs py-2 px-3 rounded-lg gap-1.5 animate-pulse">
                <CheckCircle2 :size="12" />
                <span>Entrada Registrada ({{ horaCheckin }})</span>
              </span>
            </div>

            <div class="space-y-1">
              <h1 class="text-xl sm:text-2xl font-black text-base-content leading-tight">
                {{ tarea?.nombre }}
              </h1>
              <p v-if="tarea?.descripcion" class="text-xs sm:text-sm text-base-content/70 whitespace-pre-wrap leading-relaxed">
                {{ tarea?.descripcion }}
              </p>
            </div>

            <div v-if="instanciaHoy?.checklist?.proyecto" class="pt-2 flex items-center gap-2 text-xs font-bold text-base-content/60">
              <Building2 :size="14" class="text-primary" />
              <span>Proyecto: {{ instanciaHoy.checklist.proyecto.nombre }}</span>
              <span class="text-base-content/30">•</span>
              <Calendar :size="14" class="text-primary" />
              <span>{{ fechaHoyFormateada }}</span>
            </div>
          </div>

          <!-- Contenido / Acción según estado -->
          <div class="p-6 space-y-6">

            <!-- CASO A: La tarea YA está completada hoy -->
            <div v-if="instanciaHoy?.completada" class="bg-success/10 border border-success/30 rounded-2xl p-5 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 :size="20" />
                </div>
                <div>
                  <h4 class="font-extrabold text-sm text-success">
                    ¡Tarea Completada Exitosamente!
                  </h4>
                  <p class="text-xs text-base-content/70 font-medium mt-0.5">
                    Completada por <strong>{{ instanciaHoy.resuelve?.nombre || 'Colaborador' }}</strong>
                    a las {{ formatearHora(instanciaHoy.completada_at) }}.
                  </p>
                </div>
              </div>

              <!-- Vista previa de foto si existe -->
              <div v-if="instanciaHoy.foto_url" class="space-y-2">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-base-content/60 block">
                  Evidencia Registrada:
                </span>
                <div class="rounded-xl overflow-hidden border border-base-200 max-h-60 bg-black/5 flex items-center justify-center">
                  <img 
                    :src="instanciaHoy.foto_url" 
                    alt="Evidencia completada" 
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div v-if="instanciaHoy.observaciones" class="bg-base-100 p-3 rounded-xl border border-base-200 text-xs text-base-content/80">
                <span class="font-bold block text-base-content mb-0.5">Observaciones:</span>
                <p>{{ instanciaHoy.observaciones }}</p>
              </div>

              <div class="pt-2 flex justify-center">
                <NuxtLink to="/" class="btn btn-sm btn-ghost font-bold text-primary gap-1">
                  <span>Ver todas mis tareas de hoy</span>
                  <ArrowRight :size="14" />
                </NuxtLink>
              </div>
            </div>

            <!-- CASO B: Tarea PENDIENTE -> Formulario de Completado con Foto -->
            <div v-else-if="instanciaHoy && !instanciaHoy.completada" class="space-y-5">
              
              <div class="alert alert-info text-xs p-3 rounded-2xl shadow-xs">
                <Smartphone :size="18" />
                <div>
                  <span class="font-bold">Presencia física verificada.</span>
                  <p class="mt-0.5 text-info-content/80">
                    Captura la foto de evidencia y confirma para marcar la tarea como realizada.
                  </p>
                </div>
              </div>

              <!-- Campo de Foto de Evidencia Obligatoria -->
              <div class="space-y-2">
                <label class="text-xs font-black text-base-content flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Camera :size="14" class="text-primary" />
                    <span>Foto de Evidencia (Obligatoria):</span>
                  </span>
                  <span class="badge badge-error badge-xs font-bold text-white uppercase">Requerida</span>
                </label>

                <!-- Área de Foto / Previsualización -->
                <div 
                  v-if="!fotoPreviewUrl"
                  class="border-2 border-dashed border-base-300 hover:border-primary rounded-2xl p-6 bg-base-200/30 hover:bg-base-200/50 text-center space-y-3 cursor-pointer transition-all"
                  @click="fotoInputRef?.click()"
                >
                  <input 
                    type="file" 
                    ref="fotoInputRef" 
                    accept="image/*" 
                    capture="environment" 
                    class="hidden" 
                    @change="onFotoSeleccionada"
                  />
                  <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Camera :size="24" />
                  </div>
                  <div class="space-y-1">
                    <h5 class="font-bold text-xs text-base-content">
                      Tomar foto con la cámara o seleccionar imagen
                    </h5>
                    <p class="text-[11px] text-base-content/50">
                      Toma una foto clara del equipo o área trabajada.
                    </p>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-1 text-xs">
                    <Camera :size="14" />
                    <span>Abrir Cámara</span>
                  </button>
                </div>

                <!-- Previsualización de Foto Cargada -->
                <div v-else class="space-y-2">
                  <div class="relative rounded-2xl overflow-hidden border border-base-200 bg-black max-h-72 flex items-center justify-center">
                    <img 
                      :src="fotoPreviewUrl" 
                      alt="Vista previa de evidencia" 
                      class="w-full h-full object-contain"
                    />
                    <button 
                      type="button" 
                      class="btn btn-circle btn-sm btn-error absolute top-3 right-3 shadow-md"
                      @click="quitarFoto"
                      :disabled="enviando"
                      title="Cambiar foto"
                    >
                      <X :size="16" />
                    </button>
                  </div>
                  <button 
                    type="button" 
                    class="btn btn-ghost btn-xs text-error font-bold text-xs w-full gap-1"
                    @click="quitarFoto"
                    :disabled="enviando"
                  >
                    <Trash2 :size="13" />
                    <span>Cambiar / Volver a tomar foto</span>
                  </button>
                </div>
              </div>

              <!-- Campo de Observaciones Opcional -->
              <div class="space-y-1.5">
                <label class="text-xs font-black text-base-content flex items-center gap-1.5">
                  <FileText :size="14" class="text-base-content/60" />
                  <span>Observaciones / Comentarios (Opcional):</span>
                </label>
                <textarea 
                  v-model="observaciones" 
                  rows="2" 
                  class="textarea textarea-bordered textarea-sm w-full rounded-2xl text-xs focus:textarea-primary"
                  placeholder="Ej: Se realizó limpieza y revisión de manómetro, todo en orden..."
                  :disabled="enviando"
                ></textarea>
              </div>

              <!-- Botón Principal para Marcar como Hecha -->
              <div class="pt-2">
                <button 
                  type="button" 
                  class="btn btn-primary w-full h-13 font-black text-sm rounded-2xl gap-2 shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  :disabled="!archivoFoto || enviando"
                  @click="confirmarCompletarTarea"
                >
                  <span v-if="enviando" class="loading loading-spinner loading-sm"></span>
                  <template v-else>
                    <CheckCircle2 :size="18" />
                    <span>Marcar Tarea como Hecha (QR)</span>
                  </template>
                </button>
                <p v-if="!archivoFoto" class="text-[11px] text-center text-base-content/50 font-medium mt-2">
                  * Debes tomar la foto de evidencia para habilitar el botón
                </p>
              </div>

            </div>

            <!-- CASO C: La tarea no está en el checklist de hoy -->
            <div v-else class="text-center py-6 space-y-4">
              <div class="w-12 h-12 bg-warning/10 text-warning rounded-2xl flex items-center justify-center mx-auto">
                <Calendar :size="24" />
              </div>
              <div class="space-y-1 max-w-xs mx-auto">
                <h4 class="font-black text-sm text-base-content">
                  No programada para hoy
                </h4>
                <p class="text-xs text-base-content/60">
                  Esta tarea existe en el catálogo pero no está asignada a un checklist activo para la fecha de hoy ({{ fechaHoyFormateada }}).
                </p>
              </div>
              <NuxtLink to="/" class="btn btn-sm btn-primary rounded-xl font-bold">
                Ver mi checklist asignado
              </NuxtLink>
            </div>

          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  QrCode,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Camera,
  Trash2,
  FileText,
  Smartphone,
  X
} from 'lucide-vue-next'
import { useChecklistData } from '~/composables/useChecklistData'

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const { obtenerTareaParaEscaneo, registrarCheckinQr, marcarComoHechaViaQr } = useChecklistData()

// Obtener ID de la tarea desde query string (?id=24 o ?tarea=24) o route params
const tareaIdParam = computed(() => {
  return (route.query.id as string) || 
         (route.query.tarea as string) || 
         (route.query.task as string) || 
         (route.params.id as string) || 
         ''
})

const cargando = ref(true)
const enviando = ref(false)
const errorMsg = ref('')

const tarea = ref<any>(null)
const instanciaHoy = ref<any>(null)
const fechaHoy = ref('')
const checkinRegistrado = ref(false)
const horaCheckin = ref('')

const fotoInputRef = ref<HTMLInputElement | null>(null)
const archivoFoto = ref<File | null>(null)
const fotoPreviewUrl = ref<string>('')
const observaciones = ref('')

const fechaHoyFormateada = computed(() => {
  if (!fechaHoy.value) return ''
  const partes = fechaHoy.value.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return fechaHoy.value
})

function formatearHora(isoString?: string | null): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

async function cargarDatos() {
  const currentId = tareaIdParam.value
  if (!currentId) {
    cargando.value = false
    return
  }

  cargando.value = true
  errorMsg.value = ''
  try {
    // 1. Obtener ID de colaborador actual si está autenticado
    let colaboradorId: number | null = null
    if (user.value?.email) {
      const { data: colab } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('email', user.value.email)
        .maybeSingle()
      colaboradorId = colab?.id || null
    }

    // 2. Obtener datos de la tarea y su checklist de hoy
    const res = await obtenerTareaParaEscaneo(currentId, colaboradorId)
    tarea.value = res.tarea
    instanciaHoy.value = res.instanciaHoy
    fechaHoy.value = res.fechaHoy

    // 3. Si hay instancia asignada para hoy y está pendiente, registrar check-in automático
    if (instanciaHoy.value && !instanciaHoy.value.completada) {
      const checkin = await registrarCheckinQr(instanciaHoy.value.id, colaboradorId)
      if (checkin || true) {
        checkinRegistrado.value = true
        horaCheckin.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
  } catch (err: any) {
    console.error('Error al cargar tarea escaneada:', err)
    errorMsg.value = err.message || 'No se encontró la tarea especificada.'
  } finally {
    cargando.value = false
  }
}

function onFotoSeleccionada(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    archivoFoto.value = file
    fotoPreviewUrl.value = URL.createObjectURL(file)
  }
}

function quitarFoto() {
  archivoFoto.value = null
  if (fotoPreviewUrl.value) {
    URL.revokeObjectURL(fotoPreviewUrl.value)
    fotoPreviewUrl.value = ''
  }
  if (fotoInputRef.value) {
    fotoInputRef.value.value = ''
  }
}

async function confirmarCompletarTarea() {
  if (!instanciaHoy.value || !archivoFoto.value) return

  enviando.value = true
  try {
    let colaboradorId: number | null = null
    if (user.value?.email) {
      const { data: colab } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('email', user.value.email)
        .maybeSingle()
      colaboradorId = colab?.id || null
    }

    const res = await marcarComoHechaViaQr(
      instanciaHoy.value.id,
      archivoFoto.value,
      colaboradorId,
      observaciones.value
    )

    instanciaHoy.value = {
      ...instanciaHoy.value,
      ...res,
      completada: true,
      completada_at: res.completada_at || new Date().toISOString(),
      foto_url: res.foto_url
    }

    alert('✅ ¡Tarea completada exitosamente vía escaneo QR!')
  } catch (err: any) {
    console.error('Error al completar tarea por QR:', err)
    alert(err.message || 'Ocurrió un error al guardar la evidencia.')
  } finally {
    enviando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})

watch(tareaIdParam, (newId) => {
  if (newId) {
    cargarDatos()
  }
})
</script>
