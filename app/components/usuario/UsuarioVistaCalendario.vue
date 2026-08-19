<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameMonth,
  isToday,
  startOfToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  FolderKanban,
  Eye,
  Camera
} from 'lucide-vue-next'
import type { Incidencia } from '~/composables/useIncidencias'

const props = defineProps({
  eventos: { type: Array as () => any[], default: () => [] },
  incidencias: { type: Array as () => Incidencia[], default: () => [] },
  proyectos: { type: Array as () => any[], default: () => [] },
  proyectoSeleccionadoId: { type: [String, Number], default: 'todos' },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits([
  'cambiar-mes',
  'iniciar-marcado',
  'desmarcar',
  'abrir-registrar-incidencia',
  'ver-incidencia',
  'update:proyectoSeleccionadoId'
])

const today = startOfToday()
const selectedDay = ref(today)
const currentMonthDate = ref(startOfMonth(today))

// Generar días del mes completando semanas completas
const days = computed(() => {
  const start = startOfWeek(currentMonthDate.value, { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(currentMonthDate.value), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
})

function previousMonth() {
  currentMonthDate.value = add(currentMonthDate.value, { months: -1 })
}

function nextMonth() {
  currentMonthDate.value = add(currentMonthDate.value, { months: 1 })
}

function goToToday() {
  currentMonthDate.value = startOfMonth(today)
  selectedDay.value = today
}

function emitirCambioMes(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 })
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')
  emit('cambiar-mes', startStr, endStr)
}

watch(currentMonthDate, (newDate) => {
  emitirCambioMes(newDate)
})

onMounted(() => {
  emitirCambioMes(currentMonthDate.value)
})

function tareasDeDia(day: Date) {
  const dateStr = format(day, 'yyyy-MM-dd')
  return (props.eventos || []).filter(e => e.fecha === dateStr)
}

function incidenciasDeDia(day: Date) {
  const dateStr = format(day, 'yyyy-MM-dd')
  return (props.incidencias || []).filter(inc => inc.fecha === dateStr)
}

const tareasDiaSeleccionado = computed(() => {
  if (!selectedDay.value) return []
  return tareasDeDia(selectedDay.value)
})

const incidenciasDiaSeleccionado = computed(() => {
  if (!selectedDay.value) return []
  return incidenciasDeDia(selectedDay.value)
})

const textoMesActual = computed(() => {
  const m = format(currentMonthDate.value, 'MMMM yyyy', { locale: es })
  return m.charAt(0).toUpperCase() + m.slice(1)
})

const textoDiaSeleccionado = computed(() => {
  if (!selectedDay.value) return ''
  const t = format(selectedDay.value, "EEEE d 'de' MMMM, yyyy", { locale: es })
  return t.charAt(0).toUpperCase() + t.slice(1)
})

const fechaSeleccionadaStr = computed(() => {
  return selectedDay.value ? format(selectedDay.value, 'yyyy-MM-dd') : null
})
</script>

<template>
  <div class="space-y-6">
    <!-- Contenedor Principal del Calendario -->
    <div class="flex flex-1 flex-col bg-base-100 rounded-3xl border border-base-200 shadow-sm overflow-hidden">
      <!-- Calendar Header -->
      <div class="flex flex-col space-y-4 p-5 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none border-b border-base-200 bg-base-100">
        <div class="flex items-center gap-4">
          <div class="hidden w-20 flex-col items-center justify-center rounded-2xl border bg-base-200/60 p-1 md:flex shadow-xs">
            <h1 class="p-0.5 text-xs uppercase font-black text-primary tracking-wider">
              {{ format(today, "MMM", { locale: es }) }}
            </h1>
            <div class="flex w-full items-center justify-center rounded-xl border bg-base-100 p-1 text-lg font-black text-base-content">
              <span>{{ format(today, "d") }}</span>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-black text-base-content">
                {{ textoMesActual }}
              </h2>
              <span class="badge badge-primary badge-sm font-bold text-[11px]">
                {{ (eventos || []).length }} tareas
              </span>
              <span v-if="(incidencias || []).length > 0" class="badge badge-warning badge-sm font-bold text-[11px] text-warning-content">
                {{ (incidencias || []).length }} incidencias
              </span>
            </div>
            <p class="text-xs text-base-content/60 font-medium mt-0.5">
              Haz clic en cualquier día para revisar tus tareas asignadas o consultar incidencias registradas.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro por Proyecto -->
          <div v-if="proyectos?.length > 1" class="flex items-center gap-2 bg-base-200/80 px-3 py-1.5 rounded-2xl border border-base-300 shadow-xs">
            <FolderKanban :size="16" class="text-primary flex-shrink-0" />
            <select
              :value="proyectoSeleccionadoId"
              @change="emit('update:proyectoSeleccionadoId', ($event.target as HTMLSelectElement).value)"
              class="select select-ghost select-xs font-semibold focus:outline-none max-w-[160px]"
            >
              <option value="todos">🏢 Todos los Proyectos</option>
              <option v-for="p in proyectos" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Controles de Navegación de Mes -->
          <div class="join shadow-xs bg-base-200 p-1 rounded-2xl border border-base-300">
            <button
              @click="previousMonth"
              class="join-item btn btn-ghost btn-xs btn-square rounded-xl"
              aria-label="Mes anterior"
              title="Mes anterior"
            >
              <ChevronLeft :size="15" :stroke-width="2.5" />
            </button>
            <button
              @click="goToToday"
              class="join-item btn btn-ghost btn-xs px-3 font-bold text-xs rounded-xl"
              title="Ir al mes actual"
            >
              Hoy
            </button>
            <button
              @click="nextMonth"
              class="join-item btn btn-ghost btn-xs btn-square rounded-xl"
              aria-label="Mes siguiente"
              title="Mes siguiente"
            >
              <ChevronRight :size="15" :stroke-width="2.5" />
            </button>
          </div>

          <!-- Botón Registrar Incidencia Rápida -->
          <button 
            class="btn btn-warning btn-sm text-warning-content gap-2 shadow-xs font-extrabold text-xs rounded-2xl"
            @click="emit('abrir-registrar-incidencia', fechaSeleccionadaStr)"
          >
            <AlertTriangle :size="15" />
            <span>Registrar Incidencia</span>
          </button>
        </div>
      </div>

      <!-- Cuadrícula del Calendario -->
      <div class="flex flex-auto flex-col">
        <!-- Encabezado de Días de la Semana -->
        <div class="grid grid-cols-7 border-b border-base-200 text-center text-xs font-bold leading-6 bg-base-200/40 text-base-content/70">
          <div class="border-r border-base-200/60 py-2.5">Dom</div>
          <div class="border-r border-base-200/60 py-2.5">Lun</div>
          <div class="border-r border-base-200/60 py-2.5">Mar</div>
          <div class="border-r border-base-200/60 py-2.5">Mié</div>
          <div class="border-r border-base-200/60 py-2.5">Jue</div>
          <div class="border-r border-base-200/60 py-2.5">Vie</div>
          <div class="py-2.5">Sáb</div>
        </div>

        <!-- Días (7 Columnas) -->
        <div class="grid grid-cols-7 border-l border-base-200 bg-base-100">
          <div
            v-for="(day, dayIdx) in days"
            :key="dayIdx"
            @click="selectedDay = day"
            :class="[
              !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, currentMonthDate) ? 'bg-base-200/30 text-base-content/30' : '',
              !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, currentMonthDate) ? 'text-base-content' : '',
              'relative flex flex-col border-b border-r border-base-200 min-h-[110px] sm:min-h-[135px] hover:bg-base-200/40 focus:z-10 transition-all p-1.5 cursor-pointer',
              isEqual(day, selectedDay) ? 'ring-2 ring-inset ring-primary bg-primary/5' : ''
            ]"
          >
            <header class="flex items-center justify-between pb-1">
              <span
                :class="[
                  isToday(day) ? 'bg-primary text-white font-black shadow-xs' : '',
                  !isToday(day) && isEqual(day, selectedDay) ? 'bg-base-content text-base-100 font-bold' : '',
                  !isToday(day) && !isEqual(day, selectedDay) && isSameMonth(day, currentMonthDate) ? 'text-base-content font-bold' : '',
                  !isSameMonth(day, currentMonthDate) ? 'text-base-content/30 font-medium' : '',
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors'
                ]"
              >
                {{ format(day, 'd') }}
              </span>

              <!-- Indicadores resumidos del día -->
              <div class="flex items-center gap-1">
                <!-- Badge Incidencias -->
                <span 
                  v-if="incidenciasDeDia(day).length > 0"
                  class="badge badge-warning badge-xs text-[9px] font-black px-1.5 py-0.5 text-warning-content"
                  title="Incidencias registradas este día"
                >
                  ⚠️ {{ incidenciasDeDia(day).length }}
                </span>

                <!-- Badge Tareas -->
                <span 
                  v-if="tareasDeDia(day).length > 0" 
                  class="badge badge-xs text-[9px] font-bold px-1.5 py-0.5"
                  :class="tareasDeDia(day).every(e => e.completada) ? 'badge-success text-white' : 'badge-primary text-white'"
                >
                  {{ tareasDeDia(day).length }}
                </span>
              </div>
            </header>
            
            <!-- Items dentro de la celda del día -->
            <div class="flex-1 overflow-y-auto max-h-[90px] space-y-1 pr-0.5">
              <!-- Incidencias primero si existen -->
              <div
                v-for="inc in incidenciasDeDia(day).slice(0, 1)"
                :key="'inc-' + inc.id"
                class="flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/10 p-1 text-[10px] leading-tight text-amber-900 dark:text-amber-200 font-bold truncate hover:bg-amber-500/20 transition-colors"
                @click.stop="emit('ver-incidencia', inc)"
                :title="'Incidencia a las ' + inc.hora + ': ' + inc.titulo"
              >
                <AlertTriangle :size="11" class="text-amber-500 flex-shrink-0" />
                <span class="truncate">{{ inc.hora }} {{ inc.titulo }}</span>
              </div>

              <!-- Tareas del día -->
              <div
                v-for="tarea in tareasDeDia(day).slice(0, 2)"
                :key="'task-' + tarea.id"
                class="flex items-start gap-1 rounded-lg border border-base-200 bg-base-100 p-1 text-xs leading-tight shadow-2xs hover:border-primary/40 transition-colors group"
                :class="tarea.completada ? 'opacity-60 bg-base-200/50' : ''"
              >
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary checkbox-xs mt-0.5 rounded-sm"
                  :checked="tarea.completada"
                  @click.stop
                  @change="(e) => { (e.target as HTMLInputElement).checked ? emit('iniciar-marcado', tarea) : emit('desmarcar', tarea.id) }"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-bold truncate text-[10px] text-base-content leading-tight" :class="{ 'line-through opacity-70': tarea.completada }">
                    {{ tarea.tarea?.nombre || tarea.tarea_nombre_snapshot || 'Tarea' }}
                  </p>
                </div>
              </div>
              
              <div v-if="(tareasDeDia(day).length + incidenciasDeDia(day).length) > 3" class="text-[9px] text-primary font-bold pl-1 pt-0.5">
                + {{ (tareasDeDia(day).length + incidenciasDeDia(day).length) - 3 }} más...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Detallado del Día Seleccionado -->
    <div class="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200 space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-2xl bg-primary/10 text-primary">
            <CalendarIcon class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-lg font-black text-base-content">
              {{ textoDiaSeleccionado }}
            </h3>
            <p class="text-xs text-base-content/60">
              {{ tareasDiaSeleccionado.length }} tarea(s) programada(s) &bull; {{ incidenciasDiaSeleccionado.length }} incidencia(s) registrada(s)
            </p>
          </div>
        </div>

        <button 
          class="btn btn-warning btn-sm text-warning-content gap-2 font-black text-xs rounded-2xl"
          @click="emit('abrir-registrar-incidencia', fechaSeleccionadaStr)"
        >
          <AlertTriangle :size="15" />
          <span>Registrar Incidencia en este Día</span>
        </button>
      </div>

      <!-- SECCIÓN 1: Incidencias Registradas en este día (si hay) -->
      <div v-if="incidenciasDiaSeleccionado.length > 0" class="space-y-3">
        <div class="flex items-center gap-2">
          <AlertTriangle :size="18" class="text-amber-500" />
          <h4 class="text-sm font-extrabold text-base-content tracking-wide uppercase">
            Incidencias del Día ({{ incidenciasDiaSeleccionado.length }})
          </h4>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="inc in incidenciasDiaSeleccionado" 
            :key="inc.id"
            class="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-500/60 transition-all cursor-pointer"
            @click="emit('ver-incidencia', inc)"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="badge badge-warning badge-sm font-bold text-[10px] text-warning-content flex items-center gap-1">
                  <Clock :size="12" /> {{ inc.hora || 'Hora N/D' }}
                </span>
                <span class="text-[10px] font-mono text-base-content/60 font-bold">
                  {{ inc.proyecto?.nombre || 'General' }}
                </span>
              </div>

              <h5 class="font-extrabold text-sm text-base-content leading-snug">
                {{ inc.titulo }}
              </h5>

              <p v-if="inc.descripcion" class="text-xs text-base-content/70 line-clamp-2">
                {{ inc.descripcion }}
              </p>

              <!-- Miniatura de la Foto si existe -->
              <div v-if="inc.foto_url" class="pt-2 flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                <img :src="inc.foto_url" alt="Foto Incidencia" class="h-10 w-12 rounded-lg object-cover border border-amber-400" />
                <span>Ver evidencia adjunta</span>
              </div>
            </div>

            <div class="pt-2 border-t border-amber-500/20 flex justify-end">
              <button class="btn btn-ghost btn-xs text-amber-800 dark:text-amber-200 font-extrabold gap-1">
                <Eye :size="13" />
                <span>Ver detalle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: Tareas Asignadas -->
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <CheckCircle2 :size="18" class="text-primary" />
          <h4 class="text-sm font-extrabold text-base-content tracking-wide uppercase">
            Mis Tareas Asignadas ({{ tareasDiaSeleccionado.length }})
          </h4>
        </div>

        <!-- Sin tareas -->
        <div v-if="tareasDiaSeleccionado.length === 0" class="alert bg-base-200/50 border border-base-300 text-center flex flex-col items-center py-8 rounded-2xl">
          <Clock class="h-8 w-8 text-base-content/30 mb-1" />
          <span class="font-bold text-sm text-base-content">No tienes tareas asignadas para {{ textoDiaSeleccionado }}</span>
          <p class="text-xs text-base-content/60 max-w-sm mt-0.5">
            Las tareas asignadas por tus supervisores o generadas automáticamente aparecerán aquí.
          </p>
        </div>

        <!-- Lista de tareas en grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="tarea in tareasDiaSeleccionado" 
            :key="tarea.id"
            class="p-4 rounded-2xl border bg-base-100 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-primary/40"
            :class="tarea.completada ? 'border-success/40 bg-success/5' : 'border-base-200'"
          >
            <div class="space-y-2">
              <div class="flex items-start justify-between gap-2">
                <span class="badge badge-sm font-mono text-[10px] bg-base-200 text-base-content/70">
                  {{ tarea.proyectoNombre || 'Proyecto' }}
                </span>

                <span 
                  class="badge badge-xs font-bold py-2 px-2"
                  :class="tarea.completada ? 'badge-success text-white' : 'badge-ghost text-base-content/70'"
                >
                  {{ tarea.completada ? '✓ Completada' : 'Pendiente' }}
                </span>
              </div>

              <div>
                <h4 class="font-black text-sm text-base-content leading-snug" :class="{ 'line-through opacity-70': tarea.completada }">
                  {{ tarea.tarea?.nombre || tarea.tarea_nombre_snapshot || 'Tarea' }}
                </h4>
                <p v-if="tarea.grupo_nombre_snapshot" class="text-[11px] text-primary font-semibold mt-0.5">
                  📁 {{ tarea.grupo_nombre_snapshot }}
                </p>
                <p v-if="tarea.tarea?.descripcion" class="text-xs text-base-content/60 mt-1 line-clamp-2">
                  {{ tarea.tarea.descripcion }}
                </p>
              </div>

              <!-- Foto de evidencia si está hecha -->
              <div v-if="tarea.completada && tarea.foto_url" class="pt-2 border-t border-base-200">
                <a :href="tarea.foto_url" target="_blank" class="text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
                  <Camera :size="14" /> Ver foto de evidencia
                </a>
              </div>
            </div>

            <!-- Botón de acción -->
            <div class="pt-3 border-t border-base-200">
              <button 
                v-if="!tarea.completada"
                type="button" 
                class="btn btn-success btn-xs gap-1.5 font-extrabold text-white shadow-xs w-full rounded-xl py-3 h-auto"
                @click="emit('iniciar-marcado', tarea)"
              >
                <CheckCircle2 :size="15" />
                Marcar como Hecha
              </button>
              <button 
                v-else
                type="button" 
                class="btn btn-ghost btn-xs text-base-content/60 hover:text-error w-full font-bold rounded-xl"
                @click="emit('desmarcar', tarea.id)"
              >
                Desmarcar Tarea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
