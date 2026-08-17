<script setup>
import { computed } from 'vue'
import { getColaboradorColor } from '~/utils/colors'

const props = defineProps({
  semana: { type: Array, required: true },
  colaboradores: { type: Array, default: () => [] },
  puedeEditar: { type: Boolean, default: true }
})

const emit = defineEmits(['marcar-hecha', 'desmarcar', 'quitar-tarea', 'iniciar-marcado'])

// Obtener lista de colaboradores y mapear sus tareas por día
const matrizData = computed(() => {
  const colaboradoresMap = {}
  
  // 1. Inicializar con todos los colaboradores proporcionados (para mostrarlos aunque no tengan tareas)
  props.colaboradores.forEach(c => {
    colaboradoresMap[c.id] = {
      id: c.id,
      nombre: c.nombre,
      color: getColaboradorColor(c.id),
      dias: {}
    }
  })
  
  // 2. Llenar con las tareas de la semana
  props.semana.forEach(dia => {
    dia.tareas?.forEach(t => {
      // Si el colaborador no estaba en la lista inicial (ej. un ex-empleado), lo agregamos
      if (!colaboradoresMap[t.colaboradorId]) {
        colaboradoresMap[t.colaboradorId] = {
          id: t.colaboradorId,
          nombre: t.colaboradorNombre,
          color: getColaboradorColor(t.colaboradorId),
          dias: {}
        }
      }
      
      // Agrupar tareas del colaborador por fecha
      if (!colaboradoresMap[t.colaboradorId].dias[dia.fecha]) {
        colaboradoresMap[t.colaboradorId].dias[dia.fecha] = []
      }
      colaboradoresMap[t.colaboradorId].dias[dia.fecha].push(t)
    })
  })
  
  return Object.values(colaboradoresMap).sort((a, b) => a.nombre.localeCompare(b.nombre))
})
</script>

<template>
  <div class="space-y-6">
    <!-- Contenedor con scroll horizontal si es necesario -->
    <div class="overflow-x-auto bg-base-100 rounded-box shadow-sm border border-base-200">
      <table class="table table-pin-rows table-pin-cols w-full">
        <!-- Encabezados de Días -->
        <thead>
          <tr class="bg-base-200">
            <th class="w-48 bg-base-200 z-20 sticky left-0 shadow-[2px_0_4px_rgba(0,0,0,0.05)] border-r border-base-300">
              Colaborador
            </th>
            <th v-for="dia in semana" :key="dia.fecha" class="min-w-[200px] text-center border-b border-base-300">
              <div class="font-semibold">{{ dia.dia }}</div>
              <div class="text-xs text-base-content/60 font-normal">{{ dia.fecha }}</div>
            </th>
          </tr>
        </thead>
        
        <!-- Filas por Colaborador -->
        <tbody>
          <tr v-for="colab in matrizData" :key="colab.id" class="border-b border-base-200 hover:bg-base-50/50 transition-colors">
            <!-- Celda Fija del Colaborador -->
            <th class="bg-base-100 sticky left-0 shadow-[2px_0_4px_rgba(0,0,0,0.05)] border-r border-base-300 align-top py-4">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: colab.color }"></span>
                <span class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{{ colab.nombre }}</span>
              </div>
            </th>
            
            <!-- Celdas de Tareas por Día -->
            <td v-for="dia in semana" :key="dia.fecha" class="align-top p-2 border-r border-base-100 last:border-r-0 border-dashed">
              <div class="space-y-2">
                <!-- Tareas de este colaborador en este día -->
                <div v-if="colab.dias[dia.fecha]?.length">
                  <div 
                    v-for="t in colab.dias[dia.fecha]" 
                    :key="t.id" 
                    class="border border-base-200 rounded-md p-2 flex gap-2 items-start transition-all"
                    :class="t.completada ? 'opacity-60 bg-base-200' : 'bg-base-100 shadow-sm'"
                    :style="!t.completada ? `border-left-width: 3px; border-left-color: ${colab.color}` : ''"
                  >
                    <input
                      type="checkbox"
                      class="checkbox checkbox-primary checkbox-xs mt-0.5"
                      :checked="t.completada"
                      :disabled="!puedeEditar"
                      @change="(e) => { e.target.checked ? emit('iniciar-marcado', t) : emit('desmarcar', t.id) }"
                    >
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium leading-tight" :class="{ 'line-through text-base-content/60': t.completada }">
                        {{ t.tarea?.nombre || t.tarea_nombre_snapshot || 'Tarea' }}
                      </p>
                    </div>
                    <button
                      v-if="puedeEditar"
                      class="btn btn-ghost btn-xs px-1 h-auto min-h-0 text-base-content/40 hover:text-error"
                      title="Quitar"
                      @click="emit('quitar-tarea', t.id)"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <!-- Si no hay tareas para este día, mostramos un espacio vacío o sutil -->
                <div v-else class="h-10 rounded-md border border-dashed border-base-200 flex items-center justify-center opacity-30">
                  <span class="text-[10px]">Sin tareas</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Asegurar que la celda fija funcione bien en scroll horizontal */
.table-pin-cols th {
  position: sticky;
  left: 0;
  z-index: 10;
}
</style>
