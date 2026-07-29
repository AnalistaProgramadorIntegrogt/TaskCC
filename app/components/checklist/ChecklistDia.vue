<script setup>
defineProps({
  dia: { type: Object, required: true }, // { fecha, dia, esHoy, checklistId, tareas }
  puedeEditar: { type: Boolean, default: true },
  tareasDisponibles: { type: Array, default: () => [] },
})

const emit = defineEmits(['marcar-hecha', 'desmarcar', 'quitar-tarea', 'cargar-recurrentes', 'agregar-tarea'])

const tareaAAgregar = ref('')

function alAgregarTarea() {
  if (!tareaAAgregar.value) return
  emit('agregar-tarea', Number(tareaAAgregar.value))
  tareaAAgregar.value = ''
}
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
        Sin tareas asignadas este día.
      </p>

      <TareaItem
        v-for="t in dia.tareas"
        :key="t.id"
        :tarea="t"
        :puede-editar="puedeEditar"
        @marcar-hecha="archivo => emit('marcar-hecha', t.id, archivo)"
        @desmarcar="emit('desmarcar', t.id)"
        @quitar="emit('quitar-tarea', t.id)"
      />

      <div v-if="puedeEditar" class="mt-2 space-y-2 border-t border-base-300 pt-2">
        <button class="btn btn-outline btn-xs btn-block" @click="emit('cargar-recurrentes')">
          + Cargar tareas recurrentes
        </button>

        <div v-if="tareasDisponibles.length" class="join w-full">
          <select v-model="tareaAAgregar" class="join-item select select-bordered select-xs w-full">
            <option value="">Agregar tarea existente…</option>
            <option v-for="t in tareasDisponibles" :key="t.id" :value="t.id">{{ t.nombre }}</option>
          </select>
          <button class="join-item btn btn-xs" @click="alAgregarTarea">Agregar</button>
        </div>
      </div>
    </div>
  </div>
</template>
