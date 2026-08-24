<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- KPI 1: Total Completadas -->
    <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-5 flex items-center justify-between">
      <div class="space-y-1">
        <div class="stat-title text-xs font-black uppercase tracking-wider text-base-content/60">
          Completadas
        </div>
        <div class="stat-value text-2xl sm:text-3xl font-black text-base-content">
          {{ totalCompletadas }}
        </div>
        <div class="stat-desc text-[11px] font-medium text-base-content/60">
          Tareas finalizadas en el período
        </div>
      </div>
      <div class="p-3 bg-primary/10 text-primary rounded-2xl shrink-0">
        <CheckCircle2 :size="28" />
      </div>
    </div>

    <!-- KPI 2: Tareas Auditadas / Revisadas -->
    <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-5 flex items-center justify-between">
      <div class="space-y-1">
        <div class="stat-title text-xs font-black uppercase tracking-wider text-success">
          Revisadas
        </div>
        <div class="stat-value text-2xl sm:text-3xl font-black text-success">
          {{ totalAuditadas }}
        </div>
        <div class="stat-desc text-[11px] font-medium text-base-content/60">
          {{ porcentajeAuditadas }}% del total revisadas
        </div>
      </div>
      <div class="p-3 bg-success/10 text-success rounded-2xl shrink-0">
        <ShieldCheck :size="28" />
      </div>
    </div>

    <!-- KPI 3: Pendientes de Revisión -->
    <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-5 flex items-center justify-between">
      <div class="space-y-1">
        <div class="stat-title text-xs font-black uppercase tracking-wider text-warning">
          Pendientes
        </div>
        <div class="stat-value text-2xl sm:text-3xl font-black text-warning">
          {{ totalPendientes }}
        </div>
        <div class="stat-desc text-[11px] font-medium text-base-content/60">
          Requieren evaluación
        </div>
      </div>
      <div class="p-3 bg-warning/10 text-warning rounded-2xl shrink-0">
        <Clock :size="28" />
      </div>
    </div>

    <!-- KPI 4: Promedio de Calificación (1 - 10) -->
    <div class="stat bg-base-100 rounded-3xl shadow-xs border border-base-200 p-5 flex items-center justify-between">
      <div class="space-y-1">
        <div class="stat-title text-xs font-black uppercase tracking-wider text-secondary">
          Promedio Calificación
        </div>
        <div class="stat-value text-2xl sm:text-3xl font-black flex items-center gap-1.5" :style="{ color: promedioColor }">
          <span>{{ promedioTexto }}</span>
          <span class="text-xs font-extrabold text-base-content/40">/ 10</span>
        </div>
        <div class="stat-desc text-[11px] font-medium text-base-content/60 flex items-center gap-1">
          <Star :size="12" class="fill-amber-400 text-amber-400" />
          <span>{{ totalConPuntaje }} evaluaciones registradas</span>
        </div>
      </div>
      <div class="p-3 bg-secondary/10 text-secondary rounded-2xl shrink-0">
        <Award :size="28" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, ShieldCheck, Clock, Award, Star } from 'lucide-vue-next'
import type { TareaAuditada } from '~/composables/useAuditoria'

const props = defineProps<{
  tareas: TareaAuditada[]
}>()

const totalCompletadas = computed(() => props.tareas.length)

const totalAuditadas = computed(() => {
  return props.tareas.filter(t => t.auditada).length
})

const totalPendientes = computed(() => {
  return props.tareas.filter(t => !t.auditada).length
})

const porcentajeAuditadas = computed(() => {
  if (totalCompletadas.value === 0) return 0
  return Math.round((totalAuditadas.value / totalCompletadas.value) * 100)
})

const tareasConPuntaje = computed(() => {
  return props.tareas.filter(t => t.auditoria_puntaje !== null && t.auditoria_puntaje !== undefined)
})

const totalConPuntaje = computed(() => tareasConPuntaje.value.length)

const promedioScore = computed(() => {
  if (tareasConPuntaje.value.length === 0) return null
  const suma = tareasConPuntaje.value.reduce((acc, t) => acc + (t.auditoria_puntaje || 0), 0)
  return suma / tareasConPuntaje.value.length
})

const promedioTexto = computed(() => {
  if (promedioScore.value === null) return '--'
  return promedioScore.value.toFixed(1)
})

const promedioColor = computed(() => {
  if (promedioScore.value === null) return 'inherit'
  if (promedioScore.value >= 9) return '#10b981'
  if (promedioScore.value >= 7) return '#3b82f6'
  if (promedioScore.value >= 5) return '#f59e0b'
  return '#ef4444'
})
</script>
