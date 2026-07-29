<template>
  <div class="w-80 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col">
    <!-- Header del sidebar -->
    <div class="p-4 border-b border-base-200 hidden lg:block">
      <h2 class="text-xl font-bold">Menú Principal</h2>
    </div>

    <!-- Links del menú -->
    <ul class="menu p-4 w-full flex-grow text-base">
      <li>
        <NuxtLink to="/checklist" active-class="active">
          📋 Checklist Semanal
        </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/" active-class="active" exact>
          🏠 Inicio
        </NuxtLink>
      </li>
    </ul>

    <!-- Pie del sidebar (versión app, etc) -->
    <div class="p-4 border-t border-base-200 text-xs text-base-content/50 text-center">
      TaskCC v1.0
    </div>
  </div>
</template>
