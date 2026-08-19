<template>
  <div class="w-80 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col">
    <!-- Header del sidebar -->
    <div class="p-4 border-b border-base-200 hidden lg:block">
      <h2 class="text-xl font-bold">Menú Principal</h2>
    </div>

    <!-- Links del menú -->
    <ul class="menu p-4 w-full flex-grow text-base gap-1">
      <li class="menu-title text-xs font-semibold text-base-content/50 uppercase tracking-wider">Operaciones</li>
      <li>
        <NuxtLink to="/" active-class="active" exact>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Mis Tareas y Calendario
        </NuxtLink>
      </li>

      <!-- Sección Administración (visible para ADMIN) -->
      <template v-if="esAdmin">
        <li class="menu-title text-xs font-semibold text-base-content/50 uppercase tracking-wider mt-4">Administración</li>
        <li>
          <NuxtLink to="/admin" active-class="active" exact>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Panel General
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin/proyectos" active-class="active">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Proyectos
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin/usuarios" active-class="active">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Usuarios
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin/roles" active-class="active">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Roles
          </NuxtLink>
        </li>
      </template>
    </ul>

    <!-- Pie del sidebar con información de usuario -->
    <div class="p-4 border-t border-base-200 text-xs text-base-content/60 flex items-center justify-between">
      <span class="font-bold">TaskCC v1.0</span>
      <span v-if="colaborador?.nombre" class="truncate max-w-[140px] text-right font-medium">{{ colaborador.nombre }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthUser } from '~/composables/useAuthUser'

const { colaborador } = useAuthUser()

const esAdmin = computed(() => {
  if (!colaborador.value) return false
  const rol = colaborador.value.roles?.rol
  if (rol === 'ADMIN') return true
  if (Array.isArray(colaborador.value.roles) && colaborador.value.roles.some((r: any) => r.rol === 'ADMIN')) return true
  return colaborador.value.rol_id === 1 || colaborador.value.rol_id === 2
})
</script>
