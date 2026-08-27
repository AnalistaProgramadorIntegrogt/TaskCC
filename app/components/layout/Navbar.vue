<template>
  <div class="navbar bg-neutral text-neutral-content shadow-sm border-b border-neutral">
    <!-- Botón para abrir el Sidebar -->
    <div class="flex-none">
      <label for="app-drawer" class="btn btn-square btn-ghost" aria-label="open sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" style="color: white;"></path>
        </svg>
      </label>
    </div>
    
    <!-- Título/Logo -->
    <div class="flex-1">
      <a class="btn btn-ghost normal-case p-0 px-2 h-auto" href="/">
        <img src="/img/logos/BLANCO 500px.png" alt="Los Altos Logo" class="h-10 object-contain brightness-0 invert" />
      </a>
    </div>
    
    <!-- Perfil / Opciones -->
    <div class="flex-none gap-2">
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar">
          <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-black">
            <span>{{ userInicial }}</span>
          </div>
        </label>
        <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box w-56 border border-base-200">
          <li class="menu-title px-4 py-2 border-b border-base-200">
            <span class="font-extrabold text-sm text-base-content">{{ colaborador?.nombre || 'Usuario' }}</span>
            <span class="text-[11px] text-base-content/60 lowercase">{{ user?.email }}</span>
          </li>
          <li class="mt-1"><NuxtLink to="/">Mi Calendario</NuxtLink></li>
          <li v-if="esAdmin"><NuxtLink to="/admin">Panel de Administración</NuxtLink></li>
          <div class="divider my-1"></div>
          <li><a class="text-error font-bold" @click="handleLogout">Cerrar Sesión</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthUser } from '~/composables/useAuthUser'

const supabase = useSupabaseClient()
const router = useRouter()
const { colaborador, user, esAdmin } = useAuthUser()

const userInicial = computed(() => {
  if (colaborador.value?.nombre) {
    return colaborador.value.nombre.charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return 'U'
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  colaborador.value = null
  router.push('/login')
}
</script>

