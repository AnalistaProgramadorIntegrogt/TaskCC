<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Clock, AlertTriangle, Camera, Plus, Eye, Calendar } from 'lucide-vue-next'
import type { Incidencia } from '~/composables/useIncidencias'

const props = defineProps({
  semana: { type: Array as () => any[], required: true },
  incidencias: { type: Array as () => Incidencia[], default: () => [] },
  proyectos: { type: Array as () => any[], default: () => [] },
  cargando: { type: Boolean, default: false }
})

const emit = defineEmits([
  'iniciar-marcado',
  'desmarcar',
  'abrir-registrar-incidencia',
  'ver-incidencia'
])

function incidenciasDeFecha(fechaStr: string) {
  return (props.incidencias || []).filter(inc => inc.fecha === fechaStr)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Grid de Días de la Semana -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      <div
        v-for="dia in semana"
        :key="dia.fecha"
        class="bg-base-100 rounded-3xl border transition-all flex flex-col justify-between shadow-xs overflow-hidden"
        :class="dia.esHoy ? 'border-primary ring-2 ring-primary/20 shadow-md bg-gradient-to-b from-primary/5 to-base-100' : 'border-base-200'"
      >
        <!-- Encabezado del Día -->
        <div class="p-4 border-b border-base-200/80 bg-base-200/40 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div 
              class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
              :class="dia.esHoy ? 'bg-primary text-white shadow-xs' : 'bg-base-300 text-base-content'"
            >
              {{ dia.fecha ? dia.fecha.split('-')[2] : '' }}
            </div>
            <div>
              <h3 class="font-extrabold text-sm text-base-content leading-tight">
                {{ dia.dia }}
              </h3>
              <p class="text-[11px] text-base-content/50 font-medium">
                {{ dia.fecha }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span v-if="dia.esHoy" class="badge badge-primary badge-xs font-black text-[9px] uppercase px-2 py-0.5">
              Hoy
            </span>
            <button
              class="btn btn-ghost btn-xs btn-circle text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              title="Registrar incidencia en este día"
              @click="emit('abrir-registrar-incidencia', dia.fecha)"
            >
              <AlertTriangle :size="14" />
            </button>
          </div>
        </div>

        <!-- Cuerpo: Tareas e Incidencias del Día -->
        <div class="p-4 space-y-4 flex-1">
          <!-- Incidencias del Día -->
          <div v-if="incidenciasDeFecha(dia.fecha).length > 0" class="space-y-2">
            <div class="flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              <AlertTriangle :size="12" />
              <span>Incidencias ({{ incidenciasDeFecha(dia.fecha).length }})</span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="inc in incidenciasDeFecha(dia.fecha)"
                :key="inc.id"
                class="p-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2 text-xs hover:border-amber-500/60 transition-all cursor-pointer"
                @click="emit('ver-incidencia', inc)"
              >
                <span class="badge badge-warning badge-xs font-bold text-[9px] text-warning-content flex-shrink-0 mt-0.5">
                  {{ inc.hora || 'N/D' }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="font-extrabold text-xs text-base-content truncate">
                    {{ inc.titulo }}
                  </p>
                  <p v-if="inc.descripcion" class="text-[11px] text-base-content/70 truncate">
                    {{ inc.descripcion }}
                  </p>
                </div>
                <img v-if="inc.foto_url" :src="inc.foto_url" alt="Foto" class="h-7 w-7 rounded-lg object-cover flex-shrink-0 border border-amber-400" />
              </div>
            </div>
          </div>

          <!-- Tareas del Día -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-[11px] font-black text-base-content/60 uppercase tracking-wider">
              <span>Tareas Asignadas</span>
              <span class="badge badge-ghost badge-xs font-bold">
                {{ (dia.tareas || []).length }}
              </span>
            </div>

            <!-- Lista de Tareas -->
            <div v-if="dia.tareas?.length" class="space-y-2">
              <div
                v-for="t in dia.tareas"
                :key="t.id"
                class="p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5"
                :class="t.completada ? 'border-success/40 bg-success/5 opacity-80' : 'border-base-200 bg-base-100 shadow-xs hover:border-primary/40'"
              >
                <div class="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-primary checkbox-sm mt-0.5 rounded-lg"
                    :checked="t.completada"
                    @change="(e) => { (e.target as HTMLInputElement).checked ? emit('iniciar-marcado', t) : emit('desmarcar', t.id) }"
                  />
                  <div class="min-w-0 flex-1">
                    <p 
                      class="text-xs font-extrabold text-base-content leading-snug"
                      :class="{ 'line-through opacity-70': t.completada }"
                    >
                      {{ t.tarea?.nombre || t.tarea_nombre_snapshot || 'Tarea' }}
                    </p>
                    <p v-if="t.grupo_nombre_snapshot" class="text-[10px] text-primary font-bold mt-0.5">
                      📁 {{ t.grupo_nombre_snapshot }}
                    </p>
                  </div>
                </div>

                <!-- Footer de la tarea con foto si completada -->
                <div v-if="t.completada && t.foto_url" class="pt-1.5 border-t border-base-200 flex justify-between items-center">
                  <a :href="t.foto_url" target="_blank" class="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
                    <Camera :size="12" /> Foto evidencia
                  </a>
                  <span class="badge badge-success badge-xs font-bold text-white text-[9px]">
                    Hecha
                  </span>
                </div>
              </div>
            </div>

            <!-- Sin tareas para este día -->
            <div v-else class="py-6 rounded-2xl border border-dashed border-base-300 flex flex-col items-center justify-center text-center p-3 opacity-60">
              <Clock class="h-5 w-5 text-base-content/40 mb-1" />
              <span class="text-xs font-semibold text-base-content/60">Sin tareas</span>
            </div>
          </div>
        </div>

        <!-- Footer del día con botón rápido de incidencia -->
        <div class="p-3 border-t border-base-200/80 bg-base-200/20 flex justify-end">
          <button 
            type="button"
            class="btn btn-ghost btn-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-bold gap-1 rounded-xl"
            @click="emit('abrir-registrar-incidencia', dia.fecha)"
          >
            <Plus :size="13" />
            <span>Incidencia</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
