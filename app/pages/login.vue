<template>
  <div class="hero bg-base-200 min-h-screen flex items-center justify-center">
    <div class="hero-content flex-col">
      <div class="card bg-base-100 w-96 shrink-0 shadow-2xl">
        <div class="card-body p-8 sm:p-10">
          <form @submit.prevent="handleLogin">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-extrabold text-base-content">Iniciar Sesión</h2>
              <p class="text-base-content/70 mt-2">Ingresa tus credenciales para continuar</p>
            </div>
            
            <div v-if="errorMsg" class="alert alert-error mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ errorMsg }}</span>
            </div>

            <fieldset class="fieldset flex flex-col gap-1">
              <div>
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Email</span>
                </label>
                <input 
                  v-model="email" 
                  type="email" 
                  class="input input-bordered w-full h-12 text-lg bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="tu@email.com" 
                  required 
                />
              </div>
              
              <div class="mt-4">
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Contraseña</span>
                </label>
                <input 
                  v-model="password" 
                  type="password" 
                  class="input input-bordered w-full h-12 text-lg tracking-widest bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              
              <div class="flex justify-between items-center mt-4">
                <a class="link link-hover text-sm font-medium text-base-content/70">¿Olvidaste tu contraseña?</a>
                <NuxtLink to="/register" class="link link-hover text-sm font-bold text-primary">Regístrate aquí</NuxtLink>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-neutral btn-lg mt-8 w-full font-bold shadow-md"
                :disabled="cargando"
              >
                <span v-if="cargando" class="loading loading-spinner"></span>
                Ingresar
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const cargando = ref(false)
const errorMsg = ref('')

onMounted(() => {
  if (route.query.error === 'pending') {
    errorMsg.value = 'Tu cuenta está pendiente de aprobación por un administrador.'
  }
})

const handleLogin = async () => {
  errorMsg.value = ''
  cargando.value = true
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      errorMsg.value = 'Email o contraseña incorrectos.'
    } else {
      errorMsg.value = 'Error al iniciar sesión: ' + error.message
    }
    cargando.value = false
    return
  }

  // La redirección y validación de "aprobado" la maneja el middleware auth.global.ts
  // Solo forzamos la recarga a la ruta principal
  router.push('/')
}
</script>
