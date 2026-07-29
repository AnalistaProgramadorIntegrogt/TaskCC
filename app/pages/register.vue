<template>
  <div class="hero bg-base-200 min-h-screen flex items-center justify-center">
    <div class="hero-content flex-col">
      <div class="card bg-base-100 w-96 shrink-0 shadow-2xl">
        <div class="card-body p-8 sm:p-10">
          <form v-if="!registroExitoso" @submit.prevent="handleRegister">
            <div class="text-center mb-8">
              <h2 class="text-3xl font-extrabold text-base-content">Registro</h2>
              <p class="text-base-content/70 mt-2">Crea tu cuenta para acceder al sistema</p>
            </div>
            
            <div v-if="errorMsg" class="alert alert-error mb-6 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{{ errorMsg }}</span>
            </div>

            <fieldset class="fieldset flex flex-col gap-1">
              <div>
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Nombre Completo</span>
                </label>
                <input 
                  v-model="form.nombre" 
                  type="text" 
                  class="input input-bordered w-full h-12 text-lg bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="Juan Pérez" 
                  required 
                />
              </div>
              
              <div class="mt-4">
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Email</span>
                </label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="input input-bordered w-full h-12 text-lg bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="juan@ejemplo.com" 
                  required 
                />
              </div>

              <div class="mt-4">
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Teléfono (Celular)</span>
                </label>
                <input 
                  v-model="form.telefono" 
                  type="tel" 
                  class="input input-bordered w-full h-12 text-lg bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="12345678" 
                  required 
                />
              </div>
              
              <div class="mt-4">
                <label class="label">
                  <span class="label-text font-bold text-base text-base-content">Contraseña</span>
                </label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="input input-bordered w-full h-12 text-lg tracking-widest bg-base-200 border-2 border-base-300 focus:border-primary" 
                  placeholder="••••••••" 
                  required 
                  minlength="6"
                />
              </div>
              
              <div class="mt-6 text-center">
                <span class="text-sm font-medium text-base-content/70">¿Ya tienes cuenta? </span>
                <NuxtLink to="/login" class="link link-hover text-sm font-bold text-primary">Inicia sesión</NuxtLink>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary btn-lg mt-6 w-full font-bold shadow-md"
                :disabled="cargando"
              >
                <span v-if="cargando" class="loading loading-spinner"></span>
                Registrarse
              </button>
            </fieldset>
          </form>

          <div v-else class="text-center py-6">
            <div class="text-success text-5xl mb-4">✓</div>
            <h3 class="text-2xl font-bold mb-2">¡Registro completado!</h3>
            <p class="mb-6">Tu cuenta ha sido creada exitosamente. Sin embargo, un administrador debe <strong>aprobar tu acceso</strong> antes de que puedas iniciar sesión.</p>
            <NuxtLink to="/login" class="btn btn-neutral w-full">Volver al inicio de sesión</NuxtLink>
          </div>
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

const form = ref({
  nombre: '',
  email: '',
  telefono: '',
  password: ''
})

const cargando = ref(false)
const errorMsg = ref('')
const registroExitoso = ref(false)

const handleRegister = async () => {
  errorMsg.value = ''
  cargando.value = true
  
  const { data, error } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
    options: {
      data: {
        nombre: form.value.nombre,
        telefono: form.value.telefono
      }
    }
  })
  
  if (error) {
    errorMsg.value = 'Error al registrarse: ' + error.message
    cargando.value = false
    return
  }

  // Deslogueamos inmediatamente para que no intente entrar directo como usuario no aprobado
  await supabase.auth.signOut()
  
  registroExitoso.value = true
  cargando.value = false
}
</script>
