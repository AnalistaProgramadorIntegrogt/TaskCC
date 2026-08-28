<template>
  <div class="bg-base-100 rounded-3xl p-5 sm:p-6 border border-base-200 shadow-xs space-y-4">
    
    <!-- Encabezado de la Tabla -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-200">
      <div>
        <h3 class="font-black text-lg text-base-content flex items-center gap-2">
          <ListFilter :size="20" class="text-primary" />
          <span>Listado de Tareas para Auditoría</span>
        </h3>
        <p class="text-xs text-base-content/60">
          Haz clic en cualquier tarea para ver la evidencia fotográfica, descripción y asignar su calificación.
        </p>
      </div>

      <div class="text-xs text-base-content/60 font-semibold">
        Total: <strong>{{ tareas.length }}</strong> tareas encontradas
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-if="cargando" class="flex flex-col items-center justify-center py-16 text-base-content/60 gap-3">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-xs font-bold">Cargando tareas para auditoría...</p>
    </div>

    <!-- Estado Vacío -->
    <div v-else-if="tareas.length === 0" class="text-center py-16 px-4 text-base-content/50 space-y-2">
      <div class="inline-flex p-4 rounded-3xl bg-base-200 mb-1">
        <Inbox :size="36" class="opacity-50 text-primary" />
      </div>
      <p class="font-black text-base text-base-content">No se encontraron tareas completadas</p>
      <p class="text-xs text-base-content/60 max-w-sm mx-auto">
        No hay tareas que coincidan con los filtros seleccionados o aún no se han completado tareas en el período.
      </p>
    </div>

    <!-- Tabla Responsiva -->
    <div v-else class="overflow-x-auto rounded-2xl border border-base-200">
      <table class="table table-zebra table-sm w-full">
        <thead>
          <tr class="bg-base-200/80 text-base-content/70 text-[11px] uppercase tracking-wider">
            <th class="text-center w-16">Evidencia</th>
            <th>Tarea & Proyecto</th>
            <th>Realizada Por</th>
            <th>Fecha y Hora</th>
            <th class="text-center">Calificación</th>
            <th>Comentario Auditor</th>
            <th class="text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in tareasPaginadas" 
            :key="item.id"
            class="hover:bg-base-200/50 transition-colors text-xs cursor-pointer group"
            @click="emit('seleccionar-tarea', item)"
          >
            <!-- Evidencia Miniatura -->
            <td class="text-center" @click.stop>
              <div 
                v-if="item.foto_url"
                class="w-11 h-11 rounded-xl overflow-hidden border border-base-300 bg-base-200 mx-auto cursor-pointer hover:scale-110 transition-transform shadow-xs"
                @click="emit('seleccionar-tarea', item)"
                title="Ver evidencia y detalle"
              >
                <img 
                  :src="item.foto_url" 
                  alt="Evidencia" 
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div v-else class="w-11 h-11 rounded-xl border border-dashed border-base-300 bg-base-200/40 flex items-center justify-center mx-auto text-base-content/30" title="Sin foto">
                <Camera :size="16" />
              </div>
            </td>

            <!-- Tarea & Proyecto -->
            <td class="max-w-xs">
              <div class="font-extrabold text-base-content leading-snug group-hover:text-primary transition-colors text-sm">
                {{ item.tarea_nombre }}
              </div>
              <div class="text-[11px] text-base-content/60 flex flex-wrap items-center gap-1.5 mt-1">
                <span class="badge badge-ghost badge-xs font-semibold">
                  📁 {{ item.grupo_nombre || 'Individual' }}
                </span>
                <span class="badge badge-primary badge-outline badge-xs font-bold">
                  {{ item.proyecto_nombre }}
                </span>
                <span v-if="item.qr_escaneado" class="badge badge-success text-white badge-xs font-bold gap-1" title="Completada presencialmente vía escaneo de Código QR">
                  <QrCode :size="10" />
                  <span>QR Verificado</span>
                </span>
              </div>
              <!-- Observación rápida si existe -->
              <p v-if="item.observaciones" class="text-[11px] text-base-content/70 italic mt-1 line-clamp-1">
                "{{ item.observaciones }}"
              </p>
            </td>

            <!-- Realizada Por -->
            <td class="whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {{ getIniciales(item.colaborador_resuelve_nombre || item.colaborador_asignado_nombre) }}
                </div>
                <div>
                  <div class="font-bold text-base-content">
                    {{ item.colaborador_resuelve_nombre || item.colaborador_asignado_nombre }}
                  </div>
                  <div v-if="item.colaborador_asignado_nombre !== item.colaborador_resuelve_nombre" class="text-[10px] text-base-content/50">
                    Asignada: {{ item.colaborador_asignado_nombre }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Fecha y Hora -->
            <td class="whitespace-nowrap text-[11px]">
              <div class="font-bold text-base-content flex items-center gap-1">
                <Clock :size="12" class="text-primary/70" />
                <span>{{ formatearHora(item.completada_at) }}</span>
              </div>
              <div class="text-[10px] text-base-content/60">
                {{ formatearFecha(item.completada_at || item.fecha) }}
              </div>
            </td>

            <!-- Calificación (1 al 10) -->
            <td class="text-center whitespace-nowrap">
              <div v-if="item.auditada && item.auditoria_puntaje" class="inline-flex flex-col items-center">
                <span 
                  class="badge badge-sm font-black text-xs px-2.5 py-1 shadow-2xs"
                  :class="getScoreBadgeClass(item.auditoria_puntaje)"
                >
                  ⭐ {{ item.auditoria_puntaje }}/10
                </span>
                <span class="text-[9px] font-bold text-base-content/60 mt-0.5">
                  {{ getScoreText(item.auditoria_puntaje) }}
                </span>
              </div>
              <span v-else class="badge badge-warning badge-sm font-bold text-[10px] text-warning-content shadow-2xs">
                ⏳ Pendiente
              </span>
            </td>

            <!-- Comentario Auditor -->
            <td class="max-w-xs">
              <div v-if="item.auditada && item.auditoria_comentario" class="text-xs text-base-content/80 line-clamp-2 leading-relaxed">
                {{ item.auditoria_comentario }}
              </div>
              <div v-else-if="item.auditada" class="text-xs text-base-content/40 italic">
                Sin comentario
              </div>
              <div v-else class="text-xs text-base-content/30 italic">
                No evaluada
              </div>
              <div v-if="item.auditor_nombre" class="text-[10px] text-primary/70 font-semibold mt-0.5">
                Por: {{ item.auditor_nombre }}
              </div>
            </td>

            <!-- Acción -->
            <td class="text-right whitespace-nowrap" @click.stop>
              <button 
                type="button" 
                class="btn btn-xs sm:btn-sm rounded-xl font-bold gap-1 shadow-2xs transition-transform group-hover:scale-105"
                :class="item.auditada ? 'btn-outline btn-success' : 'btn-primary'"
                @click="emit('seleccionar-tarea', item)"
              >
                <Award :size="14" />
                <span>{{ item.auditada ? 'Re-evaluar' : 'Calificar' }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="tareas.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-base-content/60">
      <div>
        Mostrando <strong>{{ rangoInicio + 1 }}</strong> - <strong>{{ Math.min(rangoFin, tareas.length) }}</strong> de <strong>{{ tareas.length }}</strong> tareas completadas
      </div>

      <div class="flex items-center gap-2">
        <select 
          v-model="tamanoPagina" 
          class="select select-bordered select-xs rounded-xl text-xs font-semibold"
        >
          <option :value="10">10 por página</option>
          <option :value="25">25 por página</option>
          <option :value="50">50 por página</option>
          <option :value="100">100 por página</option>
        </select>

        <div class="join shadow-xs">
          <button 
            class="join-item btn btn-xs btn-ghost" 
            :disabled="paginaActual <= 1"
            @click="paginaActual--"
          >
            «
          </button>
          <button class="join-item btn btn-xs btn-ghost font-bold text-xs">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </button>
          <button 
            class="join-item btn btn-xs btn-ghost" 
            :disabled="paginaActual >= totalPaginas"
            @click="paginaActual++"
          >
            »
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  ListFilter,
  Inbox,
  Camera,
  Clock,
  Award,
  QrCode
} from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TareaAuditada } from '~/composables/useAuditoria'
import { useAuditoria } from '~/composables/useAuditoria'

const props = defineProps<{
  tareas: TareaAuditada[]
  cargando?: boolean
}>()

const emit = defineEmits<{
  (e: 'seleccionar-tarea', tarea: TareaAuditada): void
}>()

const { getScoreBadgeClass, getScoreText } = useAuditoria()

// Paginación
const paginaActual = ref(1)
const tamanoPagina = ref(25)

const totalPaginas = computed(() => {
  return Math.ceil(props.tareas.length / tamanoPagina.value) || 1
})

const rangoInicio = computed(() => (paginaActual.value - 1) * tamanoPagina.value)
const rangoFin = computed(() => paginaActual.value * tamanoPagina.value)

const tareasPaginadas = computed(() => {
  return props.tareas.slice(rangoInicio.value, rangoFin.value)
})

watch(() => props.tareas.length, () => {
  if (paginaActual.value > totalPaginas.value) {
    paginaActual.value = 1
  }
})

function getIniciales(nombre?: string | null): string {
  if (!nombre) return 'U'
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.slice(0, 2).toUpperCase()
}

function formatearHora(fechaIso?: string | null): string {
  if (!fechaIso) return '--:--'
  try {
    const d = typeof fechaIso === 'string' ? parseISO(fechaIso) : new Date(fechaIso)
    return format(d, 'hh:mm a')
  } catch {
    return ''
  }
}

function formatearFecha(fechaIso?: string | null): string {
  if (!fechaIso) return ''
  try {
    const d = typeof fechaIso === 'string' ? (fechaIso.includes('T') ? parseISO(fechaIso) : new Date(fechaIso + 'T12:00:00')) : new Date(fechaIso)
    return format(d, 'dd MMM yyyy', { locale: es })
  } catch {
    return fechaIso
  }
}
</script>
