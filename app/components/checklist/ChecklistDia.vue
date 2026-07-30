<script setup>
import { getColaboradorColor } from '~/utils/colors'

defineProps({
  dia: { type: Object, required: true }, // { fecha, dia, esHoy, checklists, tareas }
  puedeEditar: { type: Boolean, default: true },
})

const emit = defineEmits(['marcar-hecha', 'desmarcar', 'quitar-tarea', 'iniciar-marcado'])

</script>

<template>
  <div class="card border bg-base-100" :class="dia.esHoy ? 'border-primary shadow-md' : 'border-base-300'">
    <div class="card-body gap-3 p-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">{{ dia.dia }}</h3>
        <span v-if="dia.esHoy" class="badge badge-primary badge-sm">Hoy</span>
      </div>
      <p class="-mt-2 text-xs text-base-content/50">{{ dia.fecha }}</p>

      <p v-if="!dia.tareas?.length" class="text-sm text-base-content/50">
        Sin tareas asignadas.
      </p>

      <div class="space-y-2 mt-2">
        <div 
          v-for="t in dia.tareas" 
          :key="t.id"
          class="border rounded-lg p-2 flex gap-3 items-start border-l-4"
          :style="`border-left-color: ${getColaboradorColor(t.colaboradorId)}; background-color: ${t.completada ? 'var(--fallback-b2,oklch(var(--b2)))' : 'var(--fallback-b1,oklch(var(--b1)))'}`"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-primary mt-1 checkbox-sm"
            :checked="t.completada"
            :disabled="!puedeEditar"
            @change="(e) => { e.target.checked ? emit('iniciar-marcado', t) : emit('desmarcar', t.id) }"
          >
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-sm" :class="{ 'text-base-content/40 line-through': t.completada }">
              {{ t.tarea?.nombre }}
            </p>
            <p class="text-[10px] text-base-content/60 font-semibold" :style="`color: ${getColaboradorColor(t.colaboradorId)}`">
              {{ t.colaboradorNombre }}
            </p>
          </div>
          
          <button
            v-if="puedeEditar"
            class="btn btn-ghost btn-xs text-error px-1"
            title="Quitar"
            @click="emit('quitar-tarea', t.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
