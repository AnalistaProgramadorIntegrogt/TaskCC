<template>
  <div class="w-80 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col">
    <!-- Header del sidebar -->
    <div class="p-4 border-b border-base-200 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-black tracking-tight flex items-center gap-2">
          <span>Menú Principal</span>
        </h2>
        <p class="text-[11px] text-base-content/60 font-medium">Vistas y herramientas de tu rol</p>
      </div>
      <span class="badge badge-primary badge-sm font-black uppercase text-[10px] tracking-wider">
        {{ rolActualNombre }}
      </span>
    </div>

    <!-- Links del menú -->
    <div class="p-4 w-full flex-grow overflow-y-auto">
      <!-- Estado de carga -->
      <div v-if="cargandoVistas" class="flex flex-col gap-3 py-6 items-center justify-center text-base-content/50">
        <span class="loading loading-spinner loading-md text-primary"></span>
        <span class="text-xs font-medium">Cargando menú de accesos...</span>
      </div>

      <!-- Menú dinámico agrupado por categorías -->
      <ul v-else class="menu p-0 w-full text-sm gap-4">
        <li v-for="(vistas, categoria) in vistasPorCategoria" :key="categoria" class="space-y-1">
          <div class="menu-title text-[11px] font-black text-base-content/50 uppercase tracking-wider px-2 pb-1">
            {{ categoria }}
          </div>
          
          <ul class="space-y-1">
            <li v-for="vista in vistas" :key="vista.id || vista.ruta">
              <NuxtLink 
                :to="vista.ruta" 
                active-class="active font-bold text-primary bg-primary/10" 
                :exact="vista.ruta === '/' || vista.ruta === '/admin'"
                class="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all hover:bg-base-200"
              >
                <component 
                  :is="getVistaIcon(vista.ruta, vista.nombre)" 
                  class="size-4.5 shrink-0 opacity-80" 
                />
                <span class="truncate">{{ vista.nombre }}</span>
              </NuxtLink>
            </li>
          </ul>
        </li>

        <!-- Si no tiene ninguna vista asignada -->
        <li v-if="Object.keys(vistasPorCategoria).length === 0" class="text-center py-8 text-base-content/50 text-xs">
          No tienes vistas asignadas a tu rol actual.
        </li>
      </ul>
    </div>

    <!-- Pie del sidebar con información de usuario -->
    <div class="p-4 border-t border-base-200 text-xs text-base-content/70 flex items-center justify-between bg-base-200/30">
      <div class="flex flex-col min-w-0">
        <span class="font-bold truncate text-base-content">{{ colaborador?.nombre || 'Usuario' }}</span>
        <span class="text-[10px] text-base-content/50 truncate">{{ colaborador?.email || '' }}</span>
      </div>
      <span class="badge badge-ghost badge-xs font-mono text-[10px] uppercase shrink-0">
        {{ rolActualNombre }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthUser } from '~/composables/useAuthUser'
import { useVistasUsuario } from '~/composables/useVistasUsuario'

const { colaborador } = useAuthUser()
const { vistasPorCategoria, cargandoVistas, rolActualNombre, getVistaIcon } = useVistasUsuario()
</script>
