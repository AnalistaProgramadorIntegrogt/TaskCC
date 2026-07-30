<template>
  <div class="hero bg-base-200 min-h-screen flex items-center justify-center">
    <div class="hero-content flex-col">
      <div class="card bg-base-100 w-96 shrink-0 shadow-2xl">
        <div class="card-body p-8 sm:p-10">
          <form @submit.prevent="handleUpdate">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-extrabold text-base-content">Nueva Contraseña</h2>
              <p class="text-base-content/70 mt-2">Crea una nueva contraseña para tu cuenta</p>
            </div>
            
            <div v-if="errorMsg" class="alert alert-error mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ errorMsg }}</span>
            </div>

            <div v-if="successMsg" class="alert alert-success mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ successMsg }}</span>
            </div>

            <fieldset class="fieldset flex flex-col gap-1" :disabled="successMsg !== ''">
              <div>
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Nueva Contraseña</span>
                </label>
                <input 
                  v-model="password" 
                  type="password" 
                  class="input input-bordered w-full h-12 text-lg tracking-widest bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="••••••••" 
                  required 
                  minlength="6"
                />
              </div>

              <div class="mt-4">
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Confirmar Contraseña</span>
                </label>
                <input 
                  v-model="confirmPassword" 
                  type="password" 
                  class="input input-bordered w-full h-12 text-lg tracking-widest bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="••••••••" 
                  required 
                  minlength="6"
                />
              </div>
              
              <button 
                type="submit" 
                class="btn btn-neutral btn-lg mt-8 w-full font-bold shadow-md"
                :disabled="cargando"
              >
                <span v-if="cargando" class="loading loading-spinner"></span>
                Actualizar Contraseña
              </button>

              <div class="text-center mt-4">
                <NuxtLink to="/login" class="link link-hover text-sm font-bold text-base-content/70">Volver al inicio de sesión</NuxtLink>
              </div>
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

const password = ref('')
const confirmPassword = ref('')
const cargando = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleUpdate = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Las contraseñas no coinciden.'
    return
  }

  cargando.value = true
  
  const { error } = await supabase.auth.updateUser({
    password: password.value
  })
  
  cargando.value = false
  
  if (error) {
    errorMsg.value = 'Error al actualizar contraseña: ' + error.message
    return
  }

  successMsg.value = 'Contraseña actualizada correctamente. Redirigiendo...'
  
  setTimeout(() => {
    router.push('/')
  }, 2000)
}
</script>
