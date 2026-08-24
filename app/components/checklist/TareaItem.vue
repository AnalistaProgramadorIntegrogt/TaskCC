<script setup>
defineProps({
  tarea: { type: Object, required: true },
  puedeEditar: { type: Boolean, default: true },
})

const emit = defineEmits(['marcar-hecha', 'desmarcar', 'quitar'])

const mostrarModal = ref(false)

function alCambiarCheckbox(e) {
  if (e.target.checked) {
    mostrarModal.value = true
  } else {
    emit('desmarcar')
  }
}

function alConfirmarFoto(archivo, observaciones = '') {
  mostrarModal.value = false
  emit('marcar-hecha', archivo, observaciones)
}
</script>

<template>
  <div class="flex items-start gap-3 rounded-lg p-2 hover:bg-base-200">
    <input
      type="checkbox"
      class="checkbox checkbox-primary mt-1"
      :checked="tarea.completada"
      :disabled="!puedeEditar"
      @change="alCambiarCheckbox"
    >

    <div class="min-w-0 flex-1">
      <p class="truncate font-medium" :class="{ 'text-base-content/40 line-through': tarea.completada }">
        {{ tarea.tarea?.nombre }}
      </p>
      <p v-if="tarea.tarea?.descripcion" class="text-xs text-base-content/60">
        {{ tarea.tarea.descripcion }}
      </p>

      <div v-if="tarea.completada && tarea.foto_url" class="mt-2">
        <img :src="tarea.foto_url" alt="Evidencia de la tarea" class="h-16 w-16 rounded-md object-cover">
      </div>
    </div>

    <button
      v-if="puedeEditar"
      class="btn btn-ghost btn-xs text-error"
      title="Quitar del checklist"
      @click="emit('quitar')"
    >
      ✕
    </button>

    <FotoModal
      v-if="mostrarModal"
      @confirmar="alConfirmarFoto"
      @cancelar="mostrarModal = false"
    />
  </div>
</template>
