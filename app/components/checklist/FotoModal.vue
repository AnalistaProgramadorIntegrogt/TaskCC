<script setup>
const emit = defineEmits(['confirmar', 'cancelar'])

const previsualizacion = ref(null)
const archivoSeleccionado = ref(null)

function alSeleccionarArchivo(e) {
  const archivo = e.target.files?.[0]
  if (!archivo) return
  archivoSeleccionado.value = archivo
  previsualizacion.value = URL.createObjectURL(archivo)
}

function confirmar() {
  if (archivoSeleccionado.value) emit('confirmar', archivoSeleccionado.value)
}
</script>

<template>
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Evidencia de tarea completada</h3>
      <p class="py-2 text-sm text-base-content/60">
        Toma una foto o elige una imagen de la galería para confirmar que la tarea quedó hecha.
      </p>

      <div class="flex flex-col gap-3">
        <label class="btn btn-outline">
          📷 Tomar foto
          <input type="file" accept="image/*" capture="environment" class="hidden" @change="alSeleccionarArchivo">
        </label>

        <label class="btn btn-outline">
          🖼️ Elegir de la galería
          <input type="file" accept="image/*" class="hidden" @change="alSeleccionarArchivo">
        </label>

        <div v-if="previsualizacion" class="mt-2 flex justify-center">
          <img :src="previsualizacion" alt="Previsualización de evidencia" class="max-h-48 rounded-lg object-contain">
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="emit('cancelar')">Cancelar</button>
        <button class="btn btn-primary" :disabled="!archivoSeleccionado" @click="confirmar">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>
