<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Columna Izquierda/Central: Resumen por Colaborador (2 cols) -->
    <div class="lg:col-span-2 bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-200">
        <div>
          <h3 class="font-extrabold text-base sm:text-lg text-base-content flex items-center gap-2">
            <Users :size="20" class="text-primary" />
            <span>Asignación de Tareas por Colaborador</span>
          </h3>
          <p class="text-xs text-base-content/60">
            Total de tareas asignadas a cada persona en el período seleccionado.
          </p>
        </div>
        <span class="badge badge-neutral badge-sm font-bold self-start sm:self-auto">
          {{ colaboradores.length }} {{ colaboradores.length === 1 ? 'colaborador' : 'colaboradores' }}
        </span>
      </div>

      <!-- Estado Vacío -->
      <div v-if="colaboradores.length === 0" class="text-center py-10 px-4 text-base-content/50">
        <Users :size="36" class="mx-auto mb-2 opacity-30" />
        <p class="font-bold text-sm">No hay asignaciones registradas</p>
        <p class="text-xs">Ajusta los filtros de fecha o proyecto para ver datos.</p>
      </div>

      <!-- Lista de Colaboradores -->
      <div v-else class="space-y-3">
        <div 
          v-for="colab in colaboradores" 
          :key="colab.colaboradorId"
          class="p-4 rounded-2xl border border-base-200 bg-base-200/30 hover:bg-base-200/60 hover:border-primary/30 transition-all space-y-3 cursor-pointer"
          :class="colaboradorSeleccionadoId === colab.colaboradorId ? 'ring-2 ring-primary border-primary bg-primary/5' : ''"
          @click="emit('seleccionar-colaborador', colab.colaboradorId)"
        >
          <!-- Fila Superior: Nombre y Totales -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <!-- Avatar con inicial y color -->
              <div 
                class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-xs flex-shrink-0"
                :style="{ backgroundColor: colab.color }"
              >
                {{ colab.nombre.charAt(0).toUpperCase() }}
              </div>

              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-sm text-base-content">{{ colab.nombre }}</h4>
                  <span 
                    v-if="colaboradorSeleccionadoId === colab.colaboradorId"
                    class="badge badge-primary badge-xs font-bold"
                  >
                    Filtrando
                  </span>
                </div>
                <div class="flex items-center gap-3 text-xs text-base-content/60 mt-0.5">
                  <span class="font-medium flex items-center gap-1">
                    <CheckCircle2 :size="13" class="text-success" />
                    <strong>{{ colab.completadas }}</strong> completadas
                  </span>
                  <span>•</span>
                  <span class="font-medium flex items-center gap-1">
                    <Clock :size="13" class="text-warning" />
                    <strong>{{ colab.pendientes }}</strong> pendientes
                  </span>
                  <span v-if="colab.totalFotos > 0" class="hidden sm:inline-flex items-center gap-1">
                    <span>•</span>
                    <Camera :size="13" class="text-secondary" />
                    <strong>{{ colab.totalFotos }}</strong> fotos
                  </span>
                </div>
              </div>
            </div>

            <!-- Cantidad Total y Porcentaje -->
            <div class="text-right sm:self-center flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
              <div class="text-xs font-black uppercase tracking-wider text-base-content/50">
                Total Asignadas
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-black text-base-content">{{ colab.totalAsignadas }}</span>
                <span 
                  class="badge badge-sm font-black"
                  :class="colab.porcentaje === 100 ? 'badge-success' : colab.porcentaje >= 50 ? 'badge-info' : 'badge-warning'"
                >
                  {{ colab.porcentaje }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Barra de Progreso de Cumplimiento -->
          <div class="space-y-1">
            <div class="w-full bg-base-300 rounded-full h-2 overflow-hidden flex">
              <div 
                class="bg-success h-full transition-all duration-500 rounded-l-full"
                :style="{ width: `${colab.porcentaje}%` }"
              ></div>
              <div 
                class="bg-warning/50 h-full transition-all duration-500 rounded-r-full"
                :style="{ width: `${100 - colab.porcentaje}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-base-content/50 font-medium">
              <span>{{ colab.completadas }} de {{ colab.totalAsignadas }} tareas terminadas</span>
              <span>{{ colab.porcentaje }}% cumplimiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Columna Derecha: Desglose por Tipo de Checklist (1 col) -->
    <div class="bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xs space-y-4 flex flex-col">
      <div class="pb-2 border-b border-base-200">
        <h3 class="font-extrabold text-base text-base-content flex items-center gap-2">
          <CheckSquare :size="18" class="text-primary" />
          <span>Por Tipo de Checklist</span>
        </h3>
        <p class="text-xs text-base-content/60">
          Rendimiento por cada lista de verificación.
        </p>
      </div>

      <!-- Estado Vacío -->
      <div v-if="checklists.length === 0" class="text-center py-10 px-4 text-base-content/50 flex-grow flex flex-col justify-center">
        <CheckSquare :size="32" class="mx-auto mb-2 opacity-30" />
        <p class="font-bold text-xs">Sin datos de checklists</p>
      </div>

      <!-- Lista de Checklists -->
      <div v-else class="space-y-3 flex-grow">
        <div 
          v-for="chk in checklists" 
          :key="chk.id"
          class="p-3.5 rounded-2xl border border-base-200 bg-base-200/30 space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 truncate">
              <span 
                class="w-3 h-3 rounded-full flex-shrink-0"
                :style="{ backgroundColor: chk.color || '#3b82f6' }"
              ></span>
              <span class="font-bold text-xs text-base-content truncate">{{ chk.nombre }}</span>
            </div>
            <span class="text-xs font-black text-base-content flex-shrink-0">
              {{ chk.total }} <span class="text-[10px] text-base-content/50 font-normal">tareas</span>
            </span>
          </div>

          <!-- Barra de Progreso -->
          <div class="w-full bg-base-300 rounded-full h-1.5 overflow-hidden">
            <div 
              class="h-full transition-all duration-500 rounded-full"
              :style="{ width: `${chk.porcentaje}%`, backgroundColor: chk.color || '#3b82f6' }"
            ></div>
          </div>

          <div class="flex justify-between text-[11px] text-base-content/60 font-medium">
            <span>{{ chk.completadas }} completadas ({{ chk.pendientes }} pendientes)</span>
            <span class="font-bold">{{ chk.porcentaje }}%</span>
          </div>
        </div>
      </div>

      <!-- Pie Informativo -->
      <div class="pt-3 border-t border-base-200 text-[11px] text-base-content/50 text-center">
        Haz clic en cualquier colaborador para filtrar la tabla de detalle.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users, CheckCircle2, Clock, Camera, CheckSquare } from 'lucide-vue-next'
import type { ColaboradorResumenReporte, ChecklistResumenReporte } from '~/composables/useReportes'

defineProps<{
  colaboradores: ColaboradorResumenReporte[]
  checklists: ChecklistResumenReporte[]
  colaboradorSeleccionadoId?: number | string
}>()

const emit = defineEmits<{
  (e: 'seleccionar-colaborador', id: number | string): void
}>()
</script>
