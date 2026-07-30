<template>
  <div class="flex flex-col min-h-full">
    <!-- Título Principal -->
    <div class="text-center mt-12 mb-8 px-4">
      <h1 class="text-3xl md:text-5xl font-extrabold text-base-content mb-4 tracking-tight">
        ¡BIENVENIDO AL PANEL DE ADMINISTRACION!
      </h1>
      <h2 class="text-xl md:text-2xl text-base-content/80 font-medium">
        ¿Qué deseas gestionar?
      </h2>
    </div>

    <!-- Componente de Features (Cards Demo) -->
    <AdminFeatures />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  // El layout por defecto se usa automáticamente, incluyendo Navbar, Sidebar y Footer.
})
</script>
