<script setup>
import { ref, watch, computed, onMounted } from 'vue'
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
  parse,
  startOfToday,
  startOfWeek,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
} from '@lucide/vue'
import { getColaboradorColor } from '~/utils/colors'

const props = defineProps({
  eventos: { type: Array, default: () => [] }, // array de tareas enriquecidas con fecha
  puedeEditar: { type: Boolean, default: true }
})

const emit = defineEmits(['cambiar-mes', 'iniciar-marcado'])

const today = startOfToday()
const selectedDay = ref(today)
const currentMonth = ref(format(today, 'MMM-yyyy'))

const firstDayCurrentMonth = computed(() => parse(currentMonth.value, 'MMM-yyyy', new Date()))

const days = computed(() => {
  return eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth.value),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth.value)),
  })
})

function previousMonth() {
  const firstDayNextMonth = add(firstDayCurrentMonth.value, { months: -1 })
  currentMonth.value = format(firstDayNextMonth, 'MMM-yyyy')
}

function nextMonth() {
  const firstDayNextMonth = add(firstDayCurrentMonth.value, { months: 1 })
  currentMonth.value = format(firstDayNextMonth, 'MMM-yyyy')
}

function goToToday() {
  currentMonth.value = format(today, 'MMM-yyyy')
}

watch(firstDayCurrentMonth, (newDate) => {
  const start = startOfWeek(newDate)
  const end = endOfWeek(endOfMonth(newDate))
  emit('cambiar-mes', start, end)
})

onMounted(() => {
  const start = startOfWeek(firstDayCurrentMonth.value)
  const end = endOfWeek(endOfMonth(firstDayCurrentMonth.value))
  emit('cambiar-mes', start, end)
})

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
]

// Media query simple (SSR safe si es solo ref que se actualiza en mounted, pero lo simularemos con CSS classes o window)
const isDesktop = ref(true)
onMounted(() => {
  isDesktop.value = window.innerWidth >= 768
  window.addEventListener('resize', () => {
    isDesktop.value = window.innerWidth >= 768
  })
})

function eventosDeDia(day) {
  // Las fechas en DB vienen como 'YYYY-MM-DD', convertimos 'day' a ese string o viceversa
  const dateStr = format(day, 'yyyy-MM-dd')
  return props.eventos.filter(e => e.fecha === dateStr)
}
</script>

<template>
  <div class="flex flex-1 flex-col bg-base-100 rounded-xl border border-base-200">
    <!-- Calendar Header -->
    <div class="flex flex-col space-y-4 p-4 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-none">
      <div class="flex flex-auto">
        <div class="flex items-center gap-4">
          <div class="hidden w-20 flex-col items-center justify-center rounded-lg border bg-base-200 p-0.5 md:flex">
            <h1 class="p-1 text-xs uppercase text-base-content/60">
              {{ format(today, "MMM") }}
            </h1>
            <div class="flex w-full items-center justify-center rounded-lg border bg-base-100 p-0.5 text-lg font-bold">
              <span>{{ format(today, "d") }}</span>
            </div>
          </div>
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold text-base-content">
              {{ format(firstDayCurrentMonth, "MMMM, yyyy") }}
            </h2>
            <p class="text-sm text-base-content/60">
              {{ format(firstDayCurrentMonth, "MMM d, yyyy") }} - {{ format(endOfMonth(firstDayCurrentMonth), "MMM d, yyyy") }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center gap-4 md:flex-row md:gap-6">
        <button class="btn btn-outline btn-square btn-sm hidden lg:flex">
          <Search :size="16" :stroke-width="2" />
        </button>

        <div class="hidden h-6 w-[1px] bg-base-300 lg:block"></div>

        <div class="join shadow-sm">
          <button
            @click="previousMonth"
            class="join-item btn btn-outline btn-sm"
            aria-label="Navigate to previous month"
          >
            <ChevronLeft :size="16" :stroke-width="2" />
          </button>
          <button
            @click="goToToday"
            class="join-item btn btn-outline btn-sm md:w-auto w-full"
          >
            Hoy
          </button>
          <button
            @click="nextMonth"
            class="join-item btn btn-outline btn-sm"
            aria-label="Navigate to next month"
          >
            <ChevronRight :size="16" :stroke-width="2" />
          </button>
        </div>

        <div class="hidden h-6 w-[1px] bg-base-300 md:block"></div>
        <div class="h-[1px] w-full bg-base-300 md:hidden block"></div>

        <button class="btn btn-primary btn-sm w-full md:w-auto gap-2">
          <PlusCircle :size="16" :stroke-width="2" />
          <span>Nueva Tarea</span>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="lg:flex lg:flex-auto lg:flex-col">
      <!-- Week Days Header -->
      <div class="grid grid-cols-7 border-t border-b border-base-200 text-center text-xs font-semibold leading-6 lg:flex-none bg-base-50">
        <div class="border-r border-base-200 py-2.5">Dom</div>
        <div class="border-r border-base-200 py-2.5">Lun</div>
        <div class="border-r border-base-200 py-2.5">Mar</div>
        <div class="border-r border-base-200 py-2.5">Mié</div>
        <div class="border-r border-base-200 py-2.5">Jue</div>
        <div class="border-r border-base-200 py-2.5">Vie</div>
        <div class="py-2.5">Sáb</div>
      </div>

      <!-- Calendar Days -->
      <div class="flex text-xs leading-6 lg:flex-auto bg-base-100">
        <!-- Desktop View -->
        <div class="hidden w-full lg:grid lg:grid-cols-7 border-l border-base-200">
          <div
            v-for="(day, dayIdx) in days"
            :key="dayIdx"
            @click="selectedDay = day"
            :class="[
              dayIdx === 0 ? colStartClasses[getDay(day)] : '',
              !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) ? 'bg-base-200/50 text-base-content/40' : '',
              !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) ? 'text-base-content' : '',
              'relative flex flex-col border-b border-r border-base-200 min-h-[120px] hover:bg-base-200/30 focus:z-10 transition-colors',
              isEqual(day, selectedDay) ? 'ring-1 ring-inset ring-primary' : ''
            ]"
          >
            <header class="flex items-center justify-between p-2.5">
              <button
                type="button"
                :class="[
                  isEqual(day, selectedDay) ? 'text-primary-content' : '',
                  !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) ? 'text-base-content' : '',
                  !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) ? 'text-base-content/40' : '',
                  isEqual(day, selectedDay) && isToday(day) ? 'bg-primary' : '',
                  isEqual(day, selectedDay) && !isToday(day) ? 'bg-neutral text-neutral-content' : '',
                  (isEqual(day, selectedDay) || isToday(day)) ? 'font-semibold' : '',
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs hover:bg-base-300 transition-colors',
                  isToday(day) && !isEqual(day, selectedDay) ? 'text-primary border border-primary' : ''
                ]"
              >
                <time :datetime="format(day, 'yyyy-MM-dd')">
                  {{ format(day, 'd') }}
                </time>
              </button>
            </header>
            
            <!-- Events list -->
            <div class="flex-1 p-2.5 pt-0 overflow-y-auto max-h-[120px] scrollbar-hide">
              <div class="space-y-1.5">
                <!-- Limitamos a 3 tareas visibles, el resto resumido -->
                <div
                  v-for="event in eventosDeDia(day).slice(0, 3)"
                  :key="event.id"
                  class="flex items-start gap-1.5 rounded-md border border-base-200 bg-base-50 p-1.5 text-xs leading-tight shadow-sm"
                  :class="event.completada ? 'opacity-60 bg-base-200' : ''"
                  :style="!event.completada ? `border-left-width: 3px; border-left-color: ${getColaboradorColor(event.colaboradorId)}` : ''"
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-xs mt-0.5 rounded-sm"
                    :checked="event.completada"
                    :disabled="!puedeEditar"
                    @click.stop
                    @change="(e) => { e.target.checked ? emit('iniciar-marcado', event) : emit('desmarcar', event.id) }"
                  >
                  <div class="min-w-0 flex-1">
                    <p class="font-medium truncate text-[10px]" :class="{ 'line-through': event.completada }">
                      {{ event.tarea?.nombre }}
                    </p>
                    <p class="text-[9px] text-base-content/60 truncate" :style="`color: ${getColaboradorColor(event.colaboradorId)}`">
                      {{ event.colaboradorNombre }}
                    </p>
                  </div>
                </div>
                
                <div v-if="eventosDeDia(day).length > 3" class="text-[10px] text-base-content/50 font-medium pl-1">
                  + {{ eventosDeDia(day).length - 3 }} más
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile View (List-style within grid) -->
        <div class="isolate grid w-full grid-cols-7 grid-rows-5 border-l border-base-200 lg:hidden">
          <button
            v-for="(day, dayIdx) in days"
            :key="dayIdx"
            @click="selectedDay = day"
            type="button"
            :class="[
              isEqual(day, selectedDay) ? 'text-primary-content' : '',
              !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) ? 'text-base-content' : '',
              !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) ? 'text-base-content/40' : '',
              (isEqual(day, selectedDay) || isToday(day)) ? 'font-semibold' : '',
              'flex h-16 flex-col border-b border-r border-base-200 px-2 py-1.5 hover:bg-base-200/50 focus:z-10'
            ]"
          >
            <time
              :datetime="format(day, 'yyyy-MM-dd')"
              :class="[
                'ml-auto flex h-6 w-6 items-center justify-center rounded-full',
                isEqual(day, selectedDay) && isToday(day) ? 'bg-primary text-primary-content' : '',
                isEqual(day, selectedDay) && !isToday(day) ? 'bg-neutral text-neutral-content' : '',
                isToday(day) && !isEqual(day, selectedDay) ? 'text-primary font-bold' : ''
              ]"
            >
              {{ format(day, 'd') }}
            </time>
            
            <div v-if="eventosDeDia(day).length > 0" class="mt-auto w-full">
              <div class="-mx-0.5 mt-auto flex flex-wrap-reverse justify-end">
                <span
                  v-for="event in eventosDeDia(day)"
                  :key="event.id"
                  class="mx-0.5 mt-1 h-1.5 w-1.5 rounded-full"
                  :style="`background-color: ${getColaboradorColor(event.colaboradorId)}`"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
