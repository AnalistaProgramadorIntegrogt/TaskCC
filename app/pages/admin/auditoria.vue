<template>
  <div class="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    
    <!-- Encabezado Principal y Acciones -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-primary/10 text-primary rounded-2xl">
            <ShieldCheck :size="28" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-base-content tracking-tight flex items-center gap-2">
              <span>Auditoría de Tareas</span>
              <span class="badge badge-primary font-black text-xs uppercase py-2 px-2.5">
                Evaluación 1-10
              </span>
            </h1>
            <p class="text-xs sm:text-sm text-base-content/60 font-medium">
              Inspecciona tareas completadas, visualiza la evidencia fotográfica y califica su calidad de ejecución.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button 
          class="btn btn-ghost btn-sm font-bold gap-2 rounded-2xl border border-base-300 shadow-xs" 
          @click="refrescarDatos"
          :disabled="cargando"
        >
          <RotateCw :size="16" :class="{ 'animate-spin': cargando }" />
          <span>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Barra de Filtros y Búsqueda Avanzada -->
    <div class="bg-base-100 p-5 rounded-3xl border border-base-200 shadow-xs space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        <!-- Filtro 1: Buscador de texto -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text text-xs font-bold text-base-content/70 flex items-center gap-1.5">
              <Search :size="13" class="text-primary" />
              <span>Buscar Tarea o Palabra Clave</span>
            </span>
          </label>
          <div class="relative">
            <Search :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input 
              type="text" 
              v-model="busquedaTexto" 
              placeholder="Buscar por tarea, grupo, nota..." 
              class="input input-bordered input-sm w-full pl-9 rounded-2xl text-xs focus:input-primary"
            />
            <button 
              v-if="busquedaTexto" 
              class="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
              @click="busquedaTexto = ''"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Filtro 2: Colaborador -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text text-xs font-bold text-base-content/70 flex items-center gap-1.5">
              <User :size="13" class="text-primary" />
              <span>Persona que Realizó / Asignada</span>
            </span>
          </label>
          <select 
            v-model="colaboradorSeleccionado" 
            class="select select-bordered select-sm w-full rounded-2xl text-xs focus:select-primary"
          >
            <option value="todos">👥 Todos los colaboradores</option>
            <option v-for="c in colaboradoresList" :key="c.id" :value="c.id">
              👤 {{ c.nombre }}
            </option>
          </select>
        </div>

        <!-- Filtro 3: Proyecto -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text text-xs font-bold text-base-content/70 flex items-center gap-1.5">
              <FolderKanban :size="13" class="text-primary" />
              <span>Proyecto</span>
            </span>
          </label>
          <select 
            v-model="proyectoSeleccionado" 
            class="select select-bordered select-sm w-full rounded-2xl text-xs focus:select-primary"
          >
            <option value="todos">📁 Todos los proyectos</option>
            <option v-for="p in proyectosList" :key="p.id" :value="p.id">
              {{ p.nombre }}
            </option>
          </select>
        </div>

        <!-- Filtro 4: Rango de Fechas / Período -->
        <div class="form-control w-full">
          <label class="label py-1">
            <span class="label-text text-xs font-bold text-base-content/70 flex items-center gap-1.5">
              <Calendar :size="13" class="text-primary" />
              <span>Período de Tiempo</span>
            </span>
          </label>
          <select 
            v-model="periodoPredefinido" 
            class="select select-bordered select-sm w-full rounded-2xl text-xs focus:select-primary"
            @change="alCambiarPeriodo"
          >
            <option value="todas">📅 Todo el historial</option>
            <option value="mes_actual">🗓️ Este Mes</option>
            <option value="semana_actual">📆 Esta Semana</option>
            <option value="ultimos_30">🕒 Últimos 30 Días</option>
            <option value="personalizado">✏️ Rango Personalizado...</option>
          </select>
        </div>
      </div>

      <!-- Fila Secundaria de Filtros: Rango Personalizado y Pills de Estado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-base-200">
        <!-- Selector de Estado de Revisión (Pills) -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-base-content/50 hidden md:inline">
            Estado:
          </span>
          <div class="join bg-base-200 p-1 rounded-2xl border border-base-300 shadow-2xs">
            <button 
              type="button"
              class="join-item btn btn-xs font-black text-xs rounded-xl transition-all"
              :class="estadoRevision === 'todas' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
              @click="estadoRevision = 'todas'"
            >
              Todas ({{ totalTareasCompletadas }})
            </button>
            <button 
              type="button"
              class="join-item btn btn-xs font-black text-xs rounded-xl transition-all"
              :class="estadoRevision === 'pendientes' ? 'btn-warning text-warning-content shadow-xs' : 'btn-ghost text-base-content/70'"
              @click="estadoRevision = 'pendientes'"
            >
              Pendientes de Revisión ({{ totalPendientes }})
            </button>
            <button 
              type="button"
              class="join-item btn btn-xs font-black text-xs rounded-xl transition-all"
              :class="estadoRevision === 'revisadas' ? 'btn-success text-success-content shadow-xs' : 'btn-ghost text-base-content/70'"
              @click="estadoRevision = 'revisadas'"
            >
              Revisadas ({{ totalRevisadas }})
            </button>
          </div>
        </div>

        <!-- Selector de Fechas si es personalizado -->
        <div v-if="periodoPredefinido === 'personalizado'" class="flex items-center gap-2">
          <input 
            type="date" 
            v-model="fechaInicioManual" 
            class="input input-bordered input-xs rounded-xl text-xs" 
          />
          <span class="text-xs font-bold text-base-content/40">a</span>
          <input 
            type="date" 
            v-model="fechaFinManual" 
            class="input input-bordered input-xs rounded-xl text-xs" 
          />
        </div>
      </div>
    </div>

    <!-- KPIs de Auditoría -->
    <AuditoriaKpis :tareas="tareasFiltradas" />

    <!-- Tabla Principal de Tareas -->
    <AuditoriaTabla 
      :tareas="tareasFiltradas" 
      :cargando="cargando"
      @seleccionar-tarea="abrirModalAuditar"
    />

    <!-- Modal para Auditar Tarea -->
    <ModalAuditarTarea
      :is-open="modalAuditarAbierto"
      :tarea="tareaSeleccionada"
      :auditor-id="colaboradorActualId"
      @cerrar="modalAuditarAbierto = false"
      @guardada="onAuditoriaGuardada"
    />

    <!-- Toast Notification -->
    <div v-if="toastMensaje" class="toast toast-end toast-bottom z-50">
      <div class="alert font-black text-xs shadow-2xl" :class="toastTipo === 'error' ? 'alert-error' : 'alert-success'">
        <span>{{ toastMensaje }}</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  ShieldCheck,
  Search,
  User,
  FolderKanban,
  Calendar,
  RotateCw
} from 'lucide-vue-next'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays
} from 'date-fns'
import { useAuthUser } from '~/composables/useAuthUser'
import { useAuditoria, type TareaAuditada } from '~/composables/useAuditoria'
import AuditoriaKpis from '~/components/auditoria/AuditoriaKpis.vue'
import AuditoriaTabla from '~/components/auditoria/AuditoriaTabla.vue'
import ModalAuditarTarea from '~/components/auditoria/ModalAuditarTarea.vue'

definePageMeta({
  middleware: ['admin']
})

const supabase = useSupabaseClient()
const { colaborador, fetchColaborador } = useAuthUser()
const { cargarTareasParaAuditoria } = useAuditoria()

// Estados principales
const cargando = ref(true)
const todasLasTareas = ref<TareaAuditada[]>([])
const colaboradoresList = ref<any[]>([])
const proyectosList = ref<any[]>([])

// Filtros
const busquedaTexto = ref('')
const colaboradorSeleccionado = ref<string | number>('todos')
const proyectoSeleccionado = ref<string | number>('todos')
const estadoRevision = ref<'todas' | 'pendientes' | 'revisadas'>('todas')
const periodoPredefinido = ref<'todas' | 'mes_actual' | 'semana_actual' | 'ultimos_30' | 'personalizado'>('todas')

const fechaInicioManual = ref<string>('')
const fechaFinManual = ref<string>('')

// Modales
const modalAuditarAbierto = ref(false)
const tareaSeleccionada = ref<TareaAuditada | null>(null)

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

const colaboradorActualId = computed(() => {
  return colaborador.value?.id || null
})

// Cargar catálogos
async function cargarCatalogos() {
  try {
    const [colabsRes, proyectosRes] = await Promise.all([
      supabase.from('colaboradores').select('id, nombre').order('nombre', { ascending: true }),
      supabase.from('proyectos').select('id, nombre').eq('activo', true).order('nombre', { ascending: true })
    ])
    colaboradoresList.value = colabsRes.data || []
    proyectosList.value = proyectosRes.data || []
  } catch (e) {
    console.error('Error al cargar catálogos:', e)
  }
}

// Calcular fechas según período
function getRangoFechas() {
  const hoy = new Date()
  switch (periodoPredefinido.value) {
    case 'semana_actual': {
      const inicio = startOfWeek(hoy, { weekStartsOn: 1 })
      const fin = endOfWeek(hoy, { weekStartsOn: 1 })
      return {
        inicio: format(inicio, 'yyyy-MM-dd'),
        fin: format(fin, 'yyyy-MM-dd')
      }
    }
    case 'mes_actual': {
      const inicio = startOfMonth(hoy)
      const fin = endOfMonth(hoy)
      return {
        inicio: format(inicio, 'yyyy-MM-dd'),
        fin: format(fin, 'yyyy-MM-dd')
      }
    }
    case 'ultimos_30': {
      const inicio = subDays(hoy, 30)
      return {
        inicio: format(inicio, 'yyyy-MM-dd'),
        fin: format(hoy, 'yyyy-MM-dd')
      }
    }
    case 'personalizado': {
      return {
        inicio: fechaInicioManual.value || null,
        fin: fechaFinManual.value || null
      }
    }
    case 'todas':
    default:
      return { inicio: null, fin: null }
  }
}

function alCambiarPeriodo() {
  if (periodoPredefinido.value === 'personalizado') {
    const hoyStr = format(new Date(), 'yyyy-MM-dd')
    const inicioMes = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    fechaInicioManual.value = inicioMes
    fechaFinManual.value = hoyStr
  }
  refrescarDatos()
}

// Cargar todas las tareas
async function refrescarDatos() {
  cargando.value = true
  try {
    const { inicio, fin } = getRangoFechas()
    const tareas = await cargarTareasParaAuditoria({
      fechaInicio: inicio,
      fechaFin: fin,
      proyectoId: proyectoSeleccionado.value,
      colaboradorId: colaboradorSeleccionado.value
    })
    todasLasTareas.value = tareas
  } catch (err) {
    console.error('Error al refrescar datos:', err)
    mostrarToast('Error al cargar datos de tareas.', 'error')
  } finally {
    cargando.value = false
  }
}

// Filtro reactivo en memoria
const tareasFiltradas = computed(() => {
  let list = todasLasTareas.value

  // Filtro por Estado
  if (estadoRevision.value === 'pendientes') {
    list = list.filter(t => !t.auditada)
  } else if (estadoRevision.value === 'revisadas') {
    list = list.filter(t => t.auditada)
  }

  // Filtro por Colaborador
  if (colaboradorSeleccionado.value && colaboradorSeleccionado.value !== 'todos') {
    const cId = Number(colaboradorSeleccionado.value)
    list = list.filter(t => t.colaborador_asignado_id === cId || t.colaborador_resuelve_id === cId)
  }

  // Filtro por Proyecto
  if (proyectoSeleccionado.value && proyectoSeleccionado.value !== 'todos') {
    const pId = Number(proyectoSeleccionado.value)
    list = list.filter(t => t.proyecto_id === pId)
  }

  // Filtro por Texto de Búsqueda
  if (busquedaTexto.value.trim()) {
    const q = busquedaTexto.value.toLowerCase().trim()
    list = list.filter(item => 
      item.tarea_nombre.toLowerCase().includes(q) ||
      item.grupo_nombre?.toLowerCase().includes(q) ||
      item.proyecto_nombre?.toLowerCase().includes(q) ||
      item.colaborador_asignado_nombre.toLowerCase().includes(q) ||
      item.colaborador_resuelve_nombre?.toLowerCase().includes(q) ||
      item.observaciones?.toLowerCase().includes(q) ||
      item.auditoria_comentario?.toLowerCase().includes(q)
    )
  }

  return list
})

// Conteos para los botones de estado
const totalTareasCompletadas = computed(() => todasLasTareas.value.length)
const totalPendientes = computed(() => todasLasTareas.value.filter(t => !t.auditada).length)
const totalRevisadas = computed(() => todasLasTareas.value.filter(t => t.auditada).length)

// Modal de auditoría
function abrirModalAuditar(tarea: TareaAuditada) {
  tareaSeleccionada.value = tarea
  modalAuditarAbierto.value = true
}

function onAuditoriaGuardada(tareaActualizada: TareaAuditada) {
  const idx = todasLasTareas.value.findIndex(t => t.id === tareaActualizada.id)
  if (idx !== -1) {
    todasLasTareas.value[idx] = { ...todasLasTareas.value[idx], ...tareaActualizada }
  }
  mostrarToast(
    tareaActualizada.auditada 
      ? `Calificación guardada: ${tareaActualizada.auditoria_puntaje}/10 puntos.`
      : 'Tarea restablecida a estado pendiente.'
  )
}

watch([proyectoSeleccionado, colaboradorSeleccionado], () => {
  refrescarDatos()
})

watch([fechaInicioManual, fechaFinManual], () => {
  if (periodoPredefinido.value === 'personalizado' && fechaInicioManual.value && fechaFinManual.value) {
    refrescarDatos()
  }
})

onMounted(async () => {
  await fetchColaborador()
  await cargarCatalogos()
  await refrescarDatos()
})
</script>
