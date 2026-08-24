<template>
  <div class="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xs space-y-4">
    <!-- Encabezado de la Tabla y Filtros Internos -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-base-200">
      <div>
        <h3 class="font-extrabold text-base sm:text-lg text-base-content flex items-center gap-2">
          <ListFilter :size="20" class="text-primary" />
          <span>Detalle de Tareas Registradas</span>
        </h3>
        <p class="text-xs text-base-content/60">
          Listado individual de todas las tareas asignadas en el período.
        </p>
      </div>

      <!-- Controles de Búsqueda y Filtro de Estado -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Buscador -->
        <div class="relative w-full sm:w-64">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input 
            type="text" 
            v-model="busqueda" 
            placeholder="Buscar tarea o persona..." 
            class="input input-bordered input-sm w-full pl-8 text-xs rounded-xl focus:input-primary"
          />
        </div>

        <!-- Filtro por Estado (Pills) -->
        <div class="join bg-base-200 p-0.5 rounded-xl border border-base-300">
          <button 
            class="join-item btn btn-xs text-xs font-bold rounded-lg transition-all"
            :class="filtroEstado === 'todos' ? 'btn-primary shadow-xs' : 'btn-ghost text-base-content/70'"
            @click="filtroEstado = 'todos'"
          >
            Todas ({{ tareas.length }})
          </button>
          <button 
            class="join-item btn btn-xs text-xs font-bold rounded-lg transition-all"
            :class="filtroEstado === 'completadas' ? 'btn-success text-success-content shadow-xs' : 'btn-ghost text-base-content/70'"
            @click="filtroEstado = 'completadas'"
          >
            Completadas ({{ conteoCompletadas }})
          </button>
          <button 
            class="join-item btn btn-xs text-xs font-bold rounded-lg transition-all"
            :class="filtroEstado === 'pendientes' ? 'btn-warning text-warning-content shadow-xs' : 'btn-ghost text-base-content/70'"
            @click="filtroEstado = 'pendientes'"
          >
            Pendientes ({{ conteoPendientes }})
          </button>
        </div>
      </div>
    </div>

    <!-- Indicador de filtro activo por colaborador si existe -->
    <div v-if="colaboradorFiltroNombre" class="alert alert-info py-2 px-4 text-xs font-bold rounded-2xl flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Users :size="15" />
        <span>Filtrando tareas exclusivamente de: <u>{{ colaboradorFiltroNombre }}</u></span>
      </div>
      <button class="btn btn-ghost btn-xs text-xs" @click="emit('limpiar-filtro-colaborador')">
        ✕ Quitar filtro
      </button>
    </div>

    <!-- Estado Vacío -->
    <div v-if="tareasFiltradas.length === 0" class="text-center py-12 px-4 text-base-content/50">
      <div class="inline-flex p-3 rounded-full bg-base-200 mb-2">
        <Inbox :size="32" class="opacity-50" />
      </div>
      <p class="font-bold text-sm">No se encontraron tareas</p>
      <p class="text-xs text-base-content/40 mt-1">
        {{ busqueda ? 'No hay tareas que coincidan con la búsqueda.' : 'No hay registros en el rango seleccionado.' }}
      </p>
    </div>

    <!-- Tabla de Tareas -->
    <div v-else class="overflow-x-auto rounded-2xl border border-base-200">
      <table class="table table-zebra table-sm w-full">
        <thead>
          <tr class="bg-base-200/80 text-base-content/70 text-[11px] uppercase tracking-wider">
            <th>Fecha</th>
            <th>Tarea & Grupo</th>
            <th>Checklist</th>
            <th>Asignado A</th>
            <th>Estado</th>
            <th>Resuelto Por</th>
            <th class="text-center">Evidencia</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in tareasPaginadas" 
            :key="item.id"
            class="hover:bg-base-200/50 transition-colors text-xs"
          >
            <!-- Fecha -->
            <td class="whitespace-nowrap font-medium">
              <div class="font-bold text-base-content">{{ item.fecha }}</div>
              <div class="text-[10px] text-base-content/50 capitalize">{{ item.dia }}</div>
            </td>

            <!-- Tarea & Grupo -->
            <td class="max-w-xs">
              <div class="font-bold text-base-content leading-snug">{{ item.tareaNombre }}</div>
              <div class="text-[11px] text-base-content/60 truncate flex items-center gap-1 mt-0.5">
                <span class="badge badge-ghost badge-xs">{{ item.grupoNombre || 'Individual' }}</span>
                <span v-if="item.proyectoNombre" class="opacity-60">• {{ item.proyectoNombre }}</span>
              </div>
            </td>

            <!-- Checklist -->
            <td class="whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <span 
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: item.checklistColor }"
                ></span>
                <span class="font-semibold text-xs">{{ item.checklistNombre }}</span>
              </div>
            </td>

            <!-- Asignado A -->
            <td class="whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span 
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: item.colaboradorColor }"
                ></span>
                <span class="font-medium">{{ item.colaboradorAsignadoNombre }}</span>
              </div>
            </td>

            <!-- Estado -->
            <td class="whitespace-nowrap">
              <span 
                class="badge badge-sm font-black text-[10px]"
                :class="{
                  'badge-success text-success-content': item.completada,
                  'badge-warning text-warning-content': !item.completada && item.estadoTexto === 'Pendiente',
                  'badge-error text-error-content': !item.completada && item.estadoTexto === 'No realizada'
                }"
              >
                {{ item.estadoTexto }}
              </span>
            </td>

            <!-- Resuelto Por & Fecha -->
            <td class="whitespace-nowrap text-[11px]">
              <template v-if="item.completada">
                <div class="font-medium text-base-content flex items-center gap-1">
                  <CheckCircle2 :size="12" class="text-success" />
                  <span>{{ item.colaboradorResuelveNombre || item.colaboradorAsignadoNombre }}</span>
                </div>
                <div v-if="item.completadaAt" class="text-[10px] text-base-content/50">
                  {{ formatearFechaHora(item.completadaAt) }}
                </div>
              </template>
              <span v-else class="text-base-content/40 italic">Pendiente</span>
            </td>

            <!-- Evidencia Foto -->
            <td class="text-center whitespace-nowrap">
              <button 
                v-if="item.fotoUrl"
                class="btn btn-xs btn-outline btn-secondary gap-1 font-bold rounded-lg shadow-2xs hover:scale-105 transition-transform"
                @click="abrirVisorFoto(item)"
                title="Ver evidencia"
              >
                <Camera :size="13" />
                <span>Foto</span>
              </button>
              <span v-else class="text-base-content/30 text-xs">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación y Resumen de Conteo -->
    <div v-if="tareasFiltradas.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-base-content/60">
      <div>
        Mostrando <strong>{{ rangoInicio + 1 }}</strong> - <strong>{{ Math.min(rangoFin, tareasFiltradas.length) }}</strong> de <strong>{{ tareasFiltradas.length }}</strong> tareas
      </div>

      <div class="flex items-center gap-2">
        <!-- Selector de Tamaño de Página -->
        <select 
          v-model="tamanoPagina" 
          class="select select-bordered select-xs rounded-lg text-xs"
        >
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>

        <!-- Botones de Paginación -->
        <div class="join">
          <button 
            class="join-item btn btn-xs rounded-l-lg"
            :disabled="paginaActual <= 1"
            @click="paginaActual--"
          >
            « Anterior
          </button>
          <button class="join-item btn btn-xs btn-disabled font-bold">
            Pág {{ paginaActual }} / {{ totalPaginas }}
          </button>
          <button 
            class="join-item btn btn-xs rounded-r-lg"
            :disabled="paginaActual >= totalPaginas"
            @click="paginaActual++"
          >
            Siguiente »
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Visor de Foto de Evidencia -->
    <dialog class="modal modal-bottom sm:modal-middle" :class="{'modal-open': modalFotoOpen}">
      <div class="modal-box bg-base-100 p-5 max-w-lg shadow-2xl rounded-3xl border border-base-200 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-base-200">
          <div>
            <h4 class="font-extrabold text-sm text-base-content flex items-center gap-1.5">
              <Camera :size="16" class="text-secondary" />
              <span>Evidencia Fotográfica</span>
            </h4>
            <p class="text-[11px] text-base-content/60">{{ tareaSeleccionadaFoto?.tareaNombre }}</p>
          </div>
          <button class="btn btn-sm btn-circle btn-ghost" @click="modalFotoOpen = false">✕</button>
        </div>

        <div v-if="tareaSeleccionadaFoto?.fotoUrl" class="rounded-2xl overflow-hidden bg-black/5 border border-base-200 flex items-center justify-center max-h-96">
          <img 
            :src="tareaSeleccionadaFoto.fotoUrl" 
            alt="Evidencia fotográfica" 
            class="max-h-96 w-full object-contain"
          />
        </div>

        <div class="bg-base-200/50 p-3 rounded-2xl text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-base-content/60">Colaborador:</span>
            <span class="font-bold">{{ tareaSeleccionadaFoto?.colaboradorResuelveNombre || tareaSeleccionadaFoto?.colaboradorAsignadoNombre }}</span>
          </div>
          <div class="flex justify-between" v-if="tareaSeleccionadaFoto?.completadaAt">
            <span class="text-base-content/60">Completada el:</span>
            <span class="font-medium">{{ formatearFechaHora(tareaSeleccionadaFoto.completadaAt) }}</span>
          </div>
          <div v-if="tareaSeleccionadaFoto?.observaciones" class="pt-1 border-t border-base-300/60 mt-1">
            <span class="text-base-content/60 block">Observaciones:</span>
            <p class="font-medium italic mt-0.5">"{{ tareaSeleccionadaFoto.observaciones }}"</p>
          </div>
        </div>

        <div class="modal-action mt-2">
          <a 
            v-if="tareaSeleccionadaFoto?.fotoUrl" 
            :href="tareaSeleccionadaFoto.fotoUrl" 
            target="_blank" 
            class="btn btn-sm btn-ghost gap-1.5 text-xs mr-auto"
          >
            <ExternalLink :size="14" />
            <span>Abrir original</span>
          </a>
          <button class="btn btn-sm btn-primary rounded-xl px-5 font-bold" @click="modalFotoOpen = false">
            Cerrar
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="modalFotoOpen = false">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  ListFilter, 
  Search, 
  Users, 
  Inbox, 
  CheckCircle2, 
  Camera, 
  ExternalLink 
} from 'lucide-vue-next'
import type { TareaReporteItem } from '~/composables/useReportes'

const props = defineProps<{
  tareas: TareaReporteItem[]
  colaboradorFiltroNombre?: string
}>()

const emit = defineEmits<{
  (e: 'limpiar-filtro-colaborador'): void
}>()

// Estados locales
const busqueda = ref('')
const filtroEstado = ref<'todos' | 'completadas' | 'pendientes'>('todos')
const paginaActual = ref(1)
const tamanoPagina = ref(25)

// Modal Foto
const modalFotoOpen = ref(false)
const tareaSeleccionadaFoto = ref<TareaReporteItem | null>(null)

// Conteos
const conteoCompletadas = computed(() => props.tareas.filter(t => t.completada).length)
const conteoPendientes = computed(() => props.tareas.filter(t => !t.completada).length)

// Filtrado de Tareas
const tareasFiltradas = computed(() => {
  let list = props.tareas

  // Filtro por Estado
  if (filtroEstado.value === 'completadas') {
    list = list.filter(t => t.completada)
  } else if (filtroEstado.value === 'pendientes') {
    list = list.filter(t => !t.completada)
  }

  // Filtro por Búsqueda de texto
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    list = list.filter(t => 
      t.tareaNombre.toLowerCase().includes(q) ||
      t.colaboradorAsignadoNombre.toLowerCase().includes(q) ||
      (t.colaboradorResuelveNombre && t.colaboradorResuelveNombre.toLowerCase().includes(q)) ||
      (t.grupoNombre && t.grupoNombre.toLowerCase().includes(q)) ||
      t.checklistNombre.toLowerCase().includes(q) ||
      t.fecha.includes(q)
    )
  }

  return list
})

// Paginación
const totalPaginas = computed(() => {
  return Math.max(1, Math.ceil(tareasFiltradas.value.length / tamanoPagina.value))
})

const rangoInicio = computed(() => (paginaActual.value - 1) * tamanoPagina.value)
const rangoFin = computed(() => rangoInicio.value + tamanoPagina.value)

const tareasPaginadas = computed(() => {
  return tareasFiltradas.value.slice(rangoInicio.value, rangoFin.value)
})

// Resetear página al filtrar
watch([busqueda, filtroEstado, () => props.tareas], () => {
  paginaActual.value = 1
})

function abrirVisorFoto(tarea: TareaReporteItem) {
  tareaSeleccionadaFoto.value = tarea
  modalFotoOpen.value = true
}

function formatearFechaHora(isoString: string) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleString('es-GT', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  } catch {
    return isoString
  }
}
</script>
