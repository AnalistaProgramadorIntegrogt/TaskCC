<template>
  <div class="w-80 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col">
    <!-- Header del sidebar -->
    <div class="p-4 border-b border-base-200 hidden lg:block">
      <h2 class="text-xl font-bold">Menú Principal</h2>
    </div>

    <!-- Links del menú -->
    <ul class="menu p-4 w-full flex-grow text-base">
      <li>
        <NuxtLink to="/admin/proyectos" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Proyectos
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
