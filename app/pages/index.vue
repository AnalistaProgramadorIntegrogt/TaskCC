<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    <!-- Banner de Bienvenida y Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2.5">
          <h1 class="text-2xl sm:text-3xl font-black text-base-content tracking-tight">
            Hola, {{ colaborador?.nombre || user?.email || 'Colaborador' }} 👋
          </h1>
          <span v-if="colaborador?.roles?.rol" class="badge badge-primary font-black uppercase text-[10px] py-2 px-2.5">
            {{ colaborador.roles.rol }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-base-content/60 font-medium">
          Aquí tienes tu calendario personal de tareas asignadas y el registro de incidencias en tiempo real.
        </p>
      </div>

      <!-- Acciones Principales -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Switch Vista Lista / Calendario -->
        <div class="join bg-base-200 p-1 rounded-2xl border border-base-300 shadow-xs">
          <button 
            class="join-item btn btn-xs sm:btn-sm font-extrabold text-xs rounded-xl gap-1.5 transition-all"
            :class="vistaActiva === 'lista' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
            @click="cambiarVista('lista')"
          >
            <ListTodo :size="15" />
            <span>Vista Lista</span>
          </button>
          <button 
            class="join-item btn btn-xs sm:btn-sm font-extrabold text-xs rounded-xl gap-1.5 transition-all"
            :class="vistaActiva === 'calendario' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
            @click="cambiarVista('calendario')"
          >
            <CalendarIcon :size="15" />
            <span>Vista Calendario</span>
          </button>
        </div>

        <!-- Botón Registrar Incidencia -->
        <button 
          class="btn btn-warning text-warning-content btn-xs sm:btn-sm font-black text-xs gap-2 rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          @click="abrirRegistrarIncidencia()"
        >
          <AlertTriangle :size="16" />
          <span>Registrar Incidencia</span>
        </button>
      </div>
    </div>

    <!-- Barra de Navegación de Fechas y Resumen (Semanal en Vista Lista) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-4 rounded-3xl border border-base-200 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-primary/10 text-primary rounded-2xl">
          <CalendarDays :size="20" />
        </div>
        <div>
          <span class="text-[11px] uppercase tracking-wider font-extrabold text-base-content/50 block">
            {{ vistaActiva === 'lista' ? 'Semana Activa' : 'Período Mensual' }}
          </span>
          <h2 class="text-base sm:text-lg font-black text-base-content">
            {{ vistaActiva === 'lista' ? rangoTexto : textoMesActual }}
          </h2>
        </div>
      </div>

      <!-- Controles de Navegación Semanal (cuando está en Vista Lista) -->
      <div v-if="vistaActiva === 'lista'" class="flex items-center gap-2">
        <div class="join bg-base-200 p-1 rounded-2xl border border-base-300 shadow-xs">
          <button 
            class="join-item btn btn-ghost btn-xs btn-square rounded-xl"
            @click="irSemanaAnterior"
            title="Semana anterior"
          >
            <ChevronLeft :size="15" :stroke-width="2.5" />
          </button>
          <button 
            class="join-item btn btn-ghost btn-xs px-3 font-extrabold text-xs rounded-xl"
            @click="irSemanaHoy"
            title="Semana actual"
          >
            Esta Semana
          </button>
          <button 
            class="join-item btn btn-ghost btn-xs btn-square rounded-xl"
            @click="irSemanaSiguiente"
            title="Semana siguiente"
          >
            <ChevronRight :size="15" :stroke-width="2.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- KPI / Tarjetas de Resumen Rápido -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-4">
        <div class="stat-figure text-primary">
          <CheckCircle2 :size="28" />
        </div>
        <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Tareas Para Hoy</div>
        <div class="stat-value text-2xl text-primary font-black">{{ tareasCompletadasHoy }}/{{ totalTareasHoy }}</div>
        <div class="stat-desc text-xs font-medium text-base-content/60">Completadas hoy</div>
      </div>

      <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-4">
        <div class="stat-figure text-secondary">
          <ListTodo :size="28" />
        </div>
        <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Total en el Período</div>
        <div class="stat-value text-2xl text-secondary font-black">{{ totalTareasPeriodo }}</div>
        <div class="stat-desc text-xs font-medium text-base-content/60">Tareas asignadas en la vista</div>
      </div>

      <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-4">
        <div class="stat-figure text-amber-500">
          <AlertTriangle :size="28" />
        </div>
        <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Incidencias Reportadas</div>
        <div class="stat-value text-2xl text-amber-500 font-black">{{ totalIncidenciasPeriodo }}</div>
        <div class="stat-desc text-xs font-medium text-base-content/60">Registradas en el período</div>
      </div>
    </div>

    <!-- Vistas Dinámicas (Mantienen el estado sin desmontarse para evitar loops de renderizado) -->
    <div>
      <!-- Vista Lista Semanal -->
      <UsuarioVistaLista
        v-if="vistaActiva === 'lista'"
        :semana="semana"
        :incidencias="incidenciasSemana"
        :proyectos="proyectos"
        :cargando="cargando"
        @iniciar-marcado="iniciarMarcado"
        @desmarcar="desmarcar"
        @abrir-registrar-incidencia="abrirRegistrarIncidencia"
        @ver-incidencia="verDetalleIncidencia"
      />

      <!-- Vista Calendario Mensual -->
      <UsuarioVistaCalendario
        v-else-if="vistaActiva === 'calendario'"
        :eventos="eventosMes"
        :incidencias="incidenciasMes"
        :proyectos="proyectos"
        v-model:proyectoSeleccionadoId="proyectoSeleccionadoId"
        :cargando="cargando"
        @cambiar-mes="onCambiarMes"
        @iniciar-marcado="iniciarMarcado"
        @desmarcar="desmarcar"
        @abrir-registrar-incidencia="abrirRegistrarIncidencia"
        @ver-incidencia="verDetalleIncidencia"
      />
    </div>

    <!-- Modales -->
    <!-- 1. Modal Registrar Incidencia -->
    <ModalRegistrarIncidencia
      v-if="colaborador"
      :is-open="modalIncidenciaAbierto"
      :colaborador-id="colaborador.id"
      :fecha-defecto="fechaIncidenciaPredefinida"
      :proyectos="proyectos"
      @cerrar="modalIncidenciaAbierto = false"
      @guardada="onIncidenciaGuardada"
    />

    <!-- 2. Modal Ver Detalle Incidencia -->
    <ModalDetalleIncidencia
      :is-open="modalDetalleIncidenciaAbierto"
      :incidencia="incidenciaSeleccionada"
      @cerrar="modalDetalleIncidenciaAbierto = false"
    />

    <!-- 3. Modal Tomar Foto Evidencia de Tarea -->
    <FotoModal
      v-if="modalFotoAbierto"
      @confirmar="confirmarFotoEvidencia"
      @cancelar="modalFotoAbierto = false"
    />

    <!-- Toast Notification -->
    <div v-if="toastMensaje" class="toast toast-end toast-bottom z-50">
      <div class="alert font-bold text-xs shadow-xl" :class="toastTipo === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMensaje }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  ListTodo,
  Calendar as CalendarIcon,
  CalendarDays,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthUser } from '~/composables/useAuthUser'
import { useSemanaUTC6 } from '~/composables/useSemanaUTC6'
import { useChecklistData } from '~/composables/useChecklistData'
import { useIncidencias, type Incidencia } from '~/composables/useIncidencias'
import UsuarioVistaLista from '~/components/usuario/UsuarioVistaLista.vue'
import UsuarioVistaCalendario from '~/components/usuario/UsuarioVistaCalendario.vue'
import ModalRegistrarIncidencia from '~/components/usuario/ModalRegistrarIncidencia.vue'
import ModalDetalleIncidencia from '~/components/usuario/ModalDetalleIncidencia.vue'
import FotoModal from '~/components/checklist/FotoModal.vue'

const supabase = useSupabaseClient()
const { colaborador, user, fetchColaborador } = useAuthUser()
const { dias, rangoTexto, semanaSiguiente, semanaAnterior } = useSemanaUTC6()
const {
  cargarSemanaColaborador,
  cargarRangoColaborador,
  marcarComoHecha,
  desmarcarTarea
} = useChecklistData()
const {
  obtenerIncidenciasUsuarioSemana,
  obtenerIncidenciasUsuarioRango
} = useIncidencias()

// Estados de Vista
const vistaActiva = ref<'lista' | 'calendario'>('lista')
const cargando = ref(false)
const proyectos = ref<any[]>([])
const proyectoSeleccionadoId = ref<string | number>('todos')

// Datos de Tareas e Incidencias
const semana = ref<any[]>([])
const eventosMes = ref<any[]>([])
const incidenciasSemana = ref<Incidencia[]>([])
const incidenciasMes = ref<Incidencia[]>([])
const rangoMesActivo = ref<{ inicio: string; fin: string }>({ inicio: '', fin: '' })

// Modales
const modalIncidenciaAbierto = ref(false)
const fechaIncidenciaPredefinida = ref<string | null>(null)
const modalDetalleIncidenciaAbierto = ref(false)
const incidenciaSeleccionada = ref<Incidencia | null>(null)
const modalFotoAbierto = ref(false)
const tareaActivaParaFoto = ref<any>(null)

// Toast
const toastMensaje = ref('')
const toastTipo = ref<'success' | 'error'>('success')

function mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
  toastMensaje.value = mensaje
  toastTipo.value = tipo
  setTimeout(() => {
    toastMensaje.value = ''
  }, 4000)
}

// Cargar catálogo de proyectos
async function cargarProyectos() {
  const { data } = await supabase
    .from('proyectos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre', { ascending: true })
  proyectos.value = data || []
}

// Cargar datos de la semana activa
async function refrescarSemana() {
  if (!colaborador.value?.id) return
  cargando.value = true
  try {
    const colabId = colaborador.value.id
    const tareasPorDia = await cargarSemanaColaborador(
      colabId,
      dias.value,
      proyectoSeleccionadoId.value
    )
    semana.value = tareasPorDia

    const fechas = dias.value.map(d => d.fecha)
    incidenciasSemana.value = await obtenerIncidenciasUsuarioSemana(colabId, fechas)
  } catch (err) {
    console.error('Error al cargar datos semanales del colaborador:', err)
  } finally {
    cargando.value = false
  }
}

// Cargar datos del mes para el calendario
async function refrescarMes(inicio: string, fin: string) {
  if (!colaborador.value?.id) return
  rangoMesActivo.value = { inicio, fin }
  cargando.value = true
  try {
    const colabId = colaborador.value.id
    eventosMes.value = await cargarRangoColaborador(
      colabId,
      inicio,
      fin,
      proyectoSeleccionadoId.value
    )
    incidenciasMes.value = await obtenerIncidenciasUsuarioRango(colabId, inicio, fin)
  } catch (err) {
    console.error('Error al cargar datos mensuales del colaborador:', err)
  } finally {
    cargando.value = false
  }
}

function cambiarVista(nuevaVista: 'lista' | 'calendario') {
  vistaActiva.value = nuevaVista
  if (nuevaVista === 'lista') {
    refrescarSemana()
  } else if (rangoMesActivo.value.inicio && rangoMesActivo.value.fin) {
    refrescarMes(rangoMesActivo.value.inicio, rangoMesActivo.value.fin)
  }
}

function onCambiarMes(startStr: string, endStr: string) {
  refrescarMes(startStr, endStr)
}

function irSemanaSiguiente() {
  semanaSiguiente()
  refrescarSemana()
}

function irSemanaAnterior() {
  semanaAnterior()
  refrescarSemana()
}

function irSemanaHoy() {
  refrescarSemana()
}

// Manejo de Tareas: Marcar / Desmarcar
function iniciarMarcado(tarea: any) {
  tareaActivaParaFoto.value = tarea
  modalFotoAbierto.value = true
}

async function confirmarFotoEvidencia(archivo: File, observaciones: string = '') {
  if (!tareaActivaParaFoto.value || !colaborador.value?.id) return
  modalFotoAbierto.value = false

  try {
    await marcarComoHecha(tareaActivaParaFoto.value.id, archivo, colaborador.value.id, observaciones)
    mostrarToast('Tarea completada exitosamente con evidencia fotográfica.')
    
    if (vistaActiva.value === 'lista') {
      await refrescarSemana()
    } else {
      await refrescarMes(rangoMesActivo.value.inicio, rangoMesActivo.value.fin)
    }
  } catch (err: any) {
    console.error('Error al marcar tarea como hecha:', err)
    mostrarToast(err.message || 'Error al completar la tarea.', 'error')
  } finally {
    tareaActivaParaFoto.value = null
  }
}

async function desmarcar(tareaId: number) {
  try {
    await desmarcarTarea(tareaId)
    mostrarToast('Tarea desmarcada.')
    if (vistaActiva.value === 'lista') {
      await refrescarSemana()
    } else {
      await refrescarMes(rangoMesActivo.value.inicio, rangoMesActivo.value.fin)
    }
  } catch (err: any) {
    console.error('Error al desmarcar tarea:', err)
    mostrarToast(err.message || 'Error al desmarcar tarea.', 'error')
  }
}

// Manejo de Incidencias
function abrirRegistrarIncidencia(fecha: string | null = null) {
  fechaIncidenciaPredefinida.value = fecha
  modalIncidenciaAbierto.value = true
}

function onIncidenciaGuardada(nuevaIncidencia: Incidencia) {
  mostrarToast(`Incidencia "${nuevaIncidencia.titulo}" registrada correctamente.`)
  if (vistaActiva.value === 'lista') {
    refrescarSemana()
  } else if (rangoMesActivo.value.inicio && rangoMesActivo.value.fin) {
    refrescarMes(rangoMesActivo.value.inicio, rangoMesActivo.value.fin)
  }
}

function verDetalleIncidencia(inc: Incidencia) {
  incidenciaSeleccionada.value = inc
  modalDetalleIncidenciaAbierto.value = true
}

// Estadísticas de Resumen (KPIs)
const hoyStr = computed(() => new Date().toISOString().split('T')[0])

const totalTareasHoy = computed(() => {
  if (vistaActiva.value === 'lista') {
    const diaHoy = semana.value.find(d => d.fecha === hoyStr.value)
    return diaHoy?.tareas?.length || 0
  } else {
    return eventosMes.value.filter(e => e.fecha === hoyStr.value).length
  }
})

const tareasCompletadasHoy = computed(() => {
  if (vistaActiva.value === 'lista') {
    const diaHoy = semana.value.find(d => d.fecha === hoyStr.value)
    return (diaHoy?.tareas || []).filter((t: any) => t.completada).length
  } else {
    return eventosMes.value.filter(e => e.fecha === hoyStr.value && e.completada).length
  }
})

const totalTareasPeriodo = computed(() => {
  if (vistaActiva.value === 'lista') {
    return semana.value.reduce((acc, dia) => acc + (dia.tareas?.length || 0), 0)
  } else {
    return eventosMes.value.length
  }
})

const totalIncidenciasPeriodo = computed(() => {
  if (vistaActiva.value === 'lista') {
    return incidenciasSemana.value.length
  } else {
    return incidenciasMes.value.length
  }
})

const textoMesActual = computed(() => {
  const m = format(new Date(), 'MMMM yyyy', { locale: es })
  return m.charAt(0).toUpperCase() + m.slice(1)
})

watch(proyectoSeleccionadoId, () => {
  if (vistaActiva.value === 'lista') {
    refrescarSemana()
  } else if (rangoMesActivo.value.inicio && rangoMesActivo.value.fin) {
    refrescarMes(rangoMesActivo.value.inicio, rangoMesActivo.value.fin)
  }
})

onMounted(async () => {
  await fetchColaborador()
  await cargarProyectos()
  await refrescarSemana()
})
</script>
