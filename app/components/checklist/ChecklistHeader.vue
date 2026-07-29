<script setup>
defineProps({
  rangoTexto: { type: String, required: true },
  colaboradores: { type: Array, default: () => [] },
  colaboradorId: { type: [Number, String, null], default: null },
})

const emit = defineEmits(['anterior', 'siguiente', 'ir-a-mes', 'cambiar-colaborador'])

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const anioActual = new Date().getFullYear()
const ANIOS = [anioActual - 1, anioActual, anioActual + 1]

function alElegirMes(valor) {
  if (!valor) return
  const [anio, mes] = valor.split('-').map(Number)
  emit('ir-a-mes', anio, mes)
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-box bg-base-200 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <button class="btn btn-circle btn-sm" aria-label="Semana anterior" @click="emit('anterior')">‹</button>
      <div class="text-center leading-tight">
        <p class="text-xs uppercase tracking-wide text-base-content/60">Semana</p>
        <p class="font-semibold">{{ rangoTexto }}</p>
      </div>
      <button class="btn btn-circle btn-sm" aria-label="Semana siguiente" @click="emit('siguiente')">›</button>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <select
        class="select select-bordered select-sm"
        @change="e => alElegirMes(e.target.value)"
      >
        <option value="" selected>Ir a mes…</option>
        <optgroup v-for="anio in ANIOS" :key="anio" :label="String(anio)">
          <option v-for="(mes, i) in MESES" :key="`${anio}-${i}`" :value="`${anio}-${i}`">
            {{ mes }}
          </option>
        </optgroup>
      </select>

      <select
        class="select select-bordered select-sm"
        :value="colaboradorId ?? ''"
        @change="e => emit('cambiar-colaborador', e.target.value ? Number(e.target.value) : null)"
      >
        <option value="">Selecciona colaborador…</option>
        <option v-for="c in colaboradores" :key="c.id" :value="c.id">{{ c.nombre }}</option>
      </select>
    </div>
  </div>
</template>
