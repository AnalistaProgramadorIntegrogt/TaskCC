<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total Tareas Asignadas -->
    <div class="stat bg-base-100 rounded-2xl shadow-xs border border-base-200 p-5 hover:border-primary/30 transition-all">
      <div class="stat-figure text-primary bg-primary/10 p-3 rounded-2xl">
        <ListTodo :size="24" />
      </div>
      <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Total Asignadas</div>
      <div class="stat-value text-3xl font-black text-base-content mt-1">{{ totalTareas }}</div>
      <div class="stat-desc text-xs font-medium text-base-content/50 mt-1">
        Tareas asignadas en el período
      </div>
    </div>

    <!-- Card 2: Tareas Completadas -->
    <div class="stat bg-base-100 rounded-2xl shadow-xs border border-base-200 p-5 hover:border-success/30 transition-all">
      <div class="stat-figure text-success bg-success/10 p-3 rounded-2xl">
        <CheckCircle2 :size="24" />
      </div>
      <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Completadas</div>
      <div class="stat-value text-3xl font-black text-success mt-1">{{ tareasCompletadas }}</div>
      <div class="stat-desc text-xs font-medium text-success/80 mt-1 flex items-center gap-1">
        <span class="font-bold">{{ porcentajeCumplimiento }}%</span> del total completado
      </div>
    </div>

    <!-- Card 3: Tareas Pendientes / En Proceso -->
    <div class="stat bg-base-100 rounded-2xl shadow-xs border border-base-200 p-5 hover:border-warning/30 transition-all">
      <div class="stat-figure text-warning bg-warning/10 p-3 rounded-2xl">
        <Clock :size="24" />
      </div>
      <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Pendientes</div>
      <div class="stat-value text-3xl font-black text-warning mt-1">{{ tareasPendientes }}</div>
      <div class="stat-desc text-xs font-medium text-base-content/50 mt-1">
        Por realizar o en curso
      </div>
    </div>

    <!-- Card 4: Efectividad y Evidencias -->
    <div class="stat bg-base-100 rounded-2xl shadow-xs border border-base-200 p-5 hover:border-secondary/30 transition-all">
      <div class="stat-figure text-secondary bg-secondary/10 p-3 rounded-2xl">
        <Camera :size="24" />
      </div>
      <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">Con Evidencias</div>
      <div class="stat-value text-3xl font-black text-secondary mt-1">{{ totalFotosEvidencia }}</div>
      <div class="stat-desc text-xs font-medium text-base-content/50 mt-1 flex items-center justify-between">
        <span>Fotos subidas</span>
        <span class="badge badge-xs badge-secondary font-bold">{{ porcentajeEvidencias }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ListTodo, CheckCircle2, Clock, Camera } from 'lucide-vue-next'

const props = defineProps<{
  totalTareas: number
  tareasCompletadas: number
  tareasPendientes: number
  porcentajeCumplimiento: number
  totalFotosEvidencia: number
}>()

const porcentajeEvidencias = computed(() => {
  if (!props.tareasCompletadas) return 0
  return Math.round((props.totalFotosEvidencia / props.tareasCompletadas) * 100)
})
</script>
