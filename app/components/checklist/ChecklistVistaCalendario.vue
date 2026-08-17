<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
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
  PlusCircle,
  Search,
  User,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Trash2
} from '@lucide/vue'
import { getColaboradorColor } from '~/utils/colors'

const props = defineProps({
  eventos: { type: Array, default: () => [] },
  colaboradores: { type: Array, default: () => [] },
  colaboradorSeleccionadoId: { type: [String, Number], default: 'todos' },
  puedeEditar: { type: Boolean, default: true }
})

const emit = defineEmits([
  'cambiar-mes', 
  'iniciar-marcado', 
  'desmarcar', 
  'update:colaboradorSeleccionadoId', 
  'update:colaborador-seleccionado-id',
  'abrir-asignacion'
])

const today = startOfToday()
const selectedDay = ref(today)
const currentMonthDate = ref(startOfMonth(today))

// Generar días del mes (completando las semanas al inicio y al final)
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

function emitirCambioMes(date) {
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

function eventosDeDia(day) {
  const dateStr = format(day, 'yyyy-MM-dd')
  return (props.eventos || []).filter(e => e.fecha === dateStr)
}

const tareasDiaSeleccionado = computed(() => {
  if (!selectedDay.value) return []
  return eventosDeDia(selectedDay.value)
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

function onCambioColaborador(val) {
  emit('update:colaboradorSeleccionadoId', val)
  emit('update:colaborador-seleccionado-id', val)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Contenedor Principal del Calendario -->
    <div class="flex flex-1 flex-col bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
      <!-- Calendar Header -->
      <div class="flex flex-col space-y-4 p-5 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none border-b border-base-200 bg-base-100">
        <div class="flex flex-auto">
          <div class="flex items-center gap-4">
            <div class="hidden w-20 flex-col items-center justify-center rounded-xl border bg-base-200/60 p-1 md:flex shadow-xs">
              <h1 class="p-0.5 text-xs uppercase font-extrabold text-primary tracking-wider">
                {{ format(today, "MMM", { locale: es }) }}
              </h1>
              <div class="flex w-full items-center justify-center rounded-lg border bg-base-100 p-1 text-lg font-black text-base-content">
                <span>{{ format(today, "d") }}</span>
              </div>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-black text-base-content">
                  {{ textoMesActual }}
                </h2>
                <span class="badge badge-primary badge-sm font-bold text-[11px]">
                  {{ (eventos || []).length }} tareas en el mes
                </span>
              </div>
              <p class="text-xs text-base-content/60 font-medium mt-0.5">
                Haz clic en cualquier día para ver sus tareas programadas o marcarlas como completadas.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-3">
          <!-- Selector de Trabajador en Calendario -->
          <div class="flex items-center gap-2 bg-base-200/80 px-3 py-1.5 rounded-xl border border-base-300 shadow-xs">
            <User :size="16" class="text-primary flex-shrink-0" />
            <span class="text-xs font-semibold text-base-content/70 hidden sm:inline whitespace-nowrap">Trabajador:</span>
            <select
              :value="colaboradorSeleccionadoId"
              @change="onCambioColaborador($event.target.value)"
              class="select select-ghost select-xs font-medium focus:outline-none max-w-[170px]"
            >
              <option value="todos">👥 Todos</option>
              <option v-for="c in colaboradores" :key="c.id" :value="c.id">
                👤 {{ c.nombre }}
              </option>
            </select>
          </div>

          <!-- Controles de Mes (Anterior / Hoy / Siguiente) -->
          <div class="join shadow-xs bg-base-200 p-0.5 rounded-xl border border-base-300">
            <button
              @click="previousMonth"
              class="join-item btn btn-ghost btn-xs btn-square"
              aria-label="Mes anterior"
              title="Mes anterior"
            >
              <ChevronLeft :size="15" :stroke-width="2.5" />
            </button>
            <button
              @click="goToToday"
              class="join-item btn btn-ghost btn-xs px-2.5 font-bold text-[11px]"
              title="Ir al mes actual"
            >
              Hoy
            </button>
            <button
              @click="nextMonth"
              class="join-item btn btn-ghost btn-xs btn-square"
              aria-label="Mes siguiente"
              title="Mes siguiente"
            >
              <ChevronRight :size="15" :stroke-width="2.5" />
            </button>
          </div>

          <button class="btn btn-primary btn-sm gap-2 shadow-xs font-bold text-xs" @click="$emit('abrir-asignacion')">
            <PlusCircle :size="16" :stroke-width="2" />
            <span>Asignar Tareas</span>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="flex flex-auto flex-col">
        <!-- Week Days Header -->
        <div class="grid grid-cols-7 border-b border-base-200 text-center text-xs font-bold leading-6 bg-base-200/40 text-base-content/70">
          <div class="border-r border-base-200/60 py-2.5">Dom</div>
          <div class="border-r border-base-200/60 py-2.5">Lun</div>
          <div class="border-r border-base-200/60 py-2.5">Mar</div>
          <div class="border-r border-base-200/60 py-2.5">Mié</div>
          <div class="border-r border-base-200/60 py-2.5">Jue</div>
          <div class="border-r border-base-200/60 py-2.5">Vie</div>
          <div class="py-2.5">Sáb</div>
        </div>

        <!-- Calendar Days Grid (7 Columnas) -->
        <div class="grid grid-cols-7 border-l border-base-200 bg-base-100">
          <div
            v-for="(day, dayIdx) in days"
            :key="dayIdx"
            @click="selectedDay = day"
            :class="[
              !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, currentMonthDate) ? 'bg-base-200/30 text-base-content/30' : '',
              !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, currentMonthDate) ? 'text-base-content' : '',
              'relative flex flex-col border-b border-r border-base-200 min-h-[110px] sm:min-h-[130px] hover:bg-base-200/40 focus:z-10 transition-all p-1.5 cursor-pointer',
              isEqual(day, selectedDay) ? 'ring-2 ring-inset ring-primary bg-primary/5' : ''
            ]"
          >
            <header class="flex items-center justify-between pb-1">
              <span
                :class="[
                  isToday(day) ? 'bg-primary text-white font-extrabold shadow-xs' : '',
                  !isToday(day) && isEqual(day, selectedDay) ? 'bg-base-content text-base-100 font-bold' : '',
                  !isToday(day) && !isEqual(day, selectedDay) && isSameMonth(day, currentMonthDate) ? 'text-base-content font-bold' : '',
                  !isSameMonth(day, currentMonthDate) ? 'text-base-content/30 font-medium' : '',
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors'
                ]"
              >
                {{ format(day, 'd') }}
              </span>

              <!-- Badge con conteo de tareas -->
              <span 
                v-if="eventosDeDia(day).length > 0" 
                class="badge badge-xs text-[9px] font-bold px-1.5 py-0.5"
                :class="eventosDeDia(day).every(e => e.completada) ? 'badge-success text-white' : 'badge-primary text-white'"
              >
                {{ eventosDeDia(day).length }}
              </span>
            </header>
            
            <!-- Vista de Tareas dentro de la celda -->
            <div class="flex-1 overflow-y-auto max-h-[90px] space-y-1 pr-0.5">
              <div
                v-for="event in eventosDeDia(day).slice(0, 3)"
                :key="event.id"
                class="flex items-start gap-1 rounded-lg border border-base-200 bg-base-100 p-1 text-xs leading-tight shadow-2xs hover:border-primary/40 transition-colors group"
                :class="event.completada ? 'opacity-60 bg-base-200/50' : ''"
                :style="!event.completada ? `border-left-width: 3px; border-left-color: ${getColaboradorColor(event.colaboradorId)}` : ''"
              >
                <input
                  type="checkbox"
                  class="checkbox checkbox-primary checkbox-xs mt-0.5 rounded-sm"
                  :checked="event.completada"
                  :disabled="!puedeEditar"
                  @click.stop
                  @change="(e) => { e.target.checked ? emit('iniciar-marcado', event) : emit('desmarcar', event.id) }"
                />
                <div class="min-w-0 flex-1">
                  <p class="font-bold truncate text-[10px] text-base-content leading-tight" :class="{ 'line-through opacity-70': event.completada }">
                    {{ event.tarea?.nombre || event.tarea_nombre_snapshot || 'Tarea' }}
                  </p>
                  <p class="text-[8px] truncate font-semibold" :style="`color: ${getColaboradorColor(event.colaboradorId)}`">
                    {{ event.colaboradorNombre }}
                  </p>
                </div>
              </div>
              
              <div v-if="eventosDeDia(day).length > 3" class="text-[9px] text-primary font-bold pl-1 pt-0.5">
                + {{ eventosDeDia(day).length - 3 }} más...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel Detallado del Día Seleccionado -->
    <div class="bg-base-100 p-6 rounded-2xl shadow-sm border border-base-200 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-200 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-primary/10 text-primary">
              <CalendarIcon class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-base font-extrabold text-base-content">
                {{ textoDiaSeleccionado }}
              </h3>
              <p class="text-xs text-base-content/60">
                {{ tareasDiaSeleccionado.length }} tarea(s) programada(s) para este día.
              </p>
            </div>
          </div>
        </div>

        <button 
          class="btn btn-primary btn-sm gap-1.5 font-bold text-xs"
          @click="$emit('abrir-asignacion')"
        >
          <PlusCircle :size="15" />
          Asignar Tareas a este Día
        </button>
      </div>

      <!-- Lista de tareas del día seleccionado -->
      <div v-if="tareasDiaSeleccionado.length === 0" class="alert bg-base-200/50 border border-base-300 text-center flex flex-col items-center py-8">
        <Clock class="h-8 w-8 text-base-content/30 mb-1" />
        <span class="font-bold text-sm text-base-content">No hay tareas programadas para {{ textoDiaSeleccionado }}</span>
        <p class="text-xs text-base-content/60 max-w-sm mt-0.5">
          Puedes programar tareas para este día desde el botón de "Asignar Tareas".
        </p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div 
          v-for="tarea in tareasDiaSeleccionado" 
          :key="tarea.id"
          class="p-4 rounded-xl border bg-base-100 shadow-xs flex flex-col justify-between space-y-3 transition-all hover:border-primary/40"
          :class="tarea.completada ? 'border-success/40 bg-success/5' : 'border-base-200'"
        >
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span 
                  class="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" 
                  :style="{ backgroundColor: getColaboradorColor(tarea.colaboradorId) }"
                ></span>
                <span class="text-xs font-extrabold text-base-content">
                  {{ tarea.colaboradorNombre }}
                </span>
              </div>

              <span 
                class="badge badge-xs font-bold py-2 px-2"
                :class="tarea.completada ? 'badge-success text-white' : 'badge-ghost text-base-content/70'"
              >
                {{ tarea.completada ? '✓ Completada' : 'Pendiente' }}
              </span>
            </div>

            <div>
              <h4 class="font-bold text-sm text-base-content leading-snug" :class="{ 'line-through opacity-70': tarea.completada }">
                {{ tarea.tarea?.nombre || tarea.tarea_nombre_snapshot || 'Tarea' }}
              </h4>
              <p v-if="tarea.grupo_nombre_snapshot" class="text-[11px] text-primary font-semibold mt-0.5">
                📁 {{ tarea.grupo_nombre_snapshot }}
              </p>
              <p v-if="tarea.tarea?.descripcion" class="text-xs text-base-content/60 mt-1 line-clamp-2">
                {{ tarea.tarea.descripcion }}
              </p>
            </div>

            <!-- Evidencia si está completada -->
            <div v-if="tarea.completada && tarea.foto_url" class="pt-2 border-t border-base-200">
              <a :href="tarea.foto_url" target="_blank" class="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                📷 Ver evidencia fotográfica
              </a>
            </div>
          </div>

          <!-- Acciones de la Tarea -->
          <div class="pt-3 border-t border-base-200 flex items-center justify-between">
            <button 
              v-if="!tarea.completada"
              type="button" 
              class="btn btn-success btn-xs gap-1 font-bold text-white shadow-xs w-full"
              @click="$emit('iniciar-marcado', tarea)"
              :disabled="!puedeEditar"
            >
              <CheckCircle2 :size="14" />
              Marcar como Hecha
            </button>
            <button 
              v-else
              type="button" 
              class="btn btn-ghost btn-xs text-base-content/60 hover:text-error w-full font-medium"
              @click="$emit('desmarcar', tarea.id)"
              :disabled="!puedeEditar"
            >
              Desmarcar Tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
