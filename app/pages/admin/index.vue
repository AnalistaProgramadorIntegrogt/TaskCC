<template>
  <div class="flex flex-col min-h-full">
    <!-- Título Principal Dinámico -->
    <div class="text-center mt-8 md:mt-12 mb-6 px-4">
      <div class="inline-flex items-center gap-2 mb-3">
        <span class="badge badge-primary badge-sm font-black uppercase tracking-wider py-2.5 px-3 shadow-xs">
          Rol: {{ rolActualNombre }}
        </span>
      </div>

      <h1 class="text-2xl sm:text-4xl md:text-5xl font-black text-base-content mb-3 tracking-tight">
        ¡BIENVENIDO AL PANEL DE {{ tituloPanel }}!
      </h1>
      <p class="text-base sm:text-lg text-base-content/70 font-medium max-w-2xl mx-auto">
        Accede a todas las herramientas, reportes y módulos asignados a tu cuenta según tu rol de usuario.
      </p>
    </div>

    <!-- Componente de Features / Directorio Dinámico -->
    <AdminFeatures />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useVistasUsuario } from '~/composables/useVistasUsuario'

const { colaborador, esAdmin } = useAuthUser()
const { rolActualNombre } = useVistasUsuario()

const tituloPanel = computed(() => {
  if (esAdmin.value) return 'ADMINISTRACIÓN'
  const rol = rolActualNombre.value.toUpperCase()
  return rol || 'CONTROL'
})

definePageMeta({
  middleware: ['admin'],
})
</script>
