<template>
  <div class="hero bg-base-200 min-h-screen flex items-center justify-center p-4">
    <div class="hero-content flex-col w-full max-w-md">
      
      <!-- Card Principal -->
      <div class="card bg-base-100 w-full shadow-2xl border border-base-300/60 rounded-3xl overflow-hidden">
        <div class="card-body p-6 sm:p-10">
          
          <!-- Header / Logo -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-3">
              <LogIn class="w-8 h-8 text-primary" />
            </div>
            <h2 class="text-3xl font-black text-base-content tracking-tight">Iniciar Sesión</h2>
            <p class="text-base-content/70 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>
          
          <!-- Alerta de Error -->
          <div 
            v-if="errorMsg" 
            class="alert alert-error mb-5 text-sm shadow-sm rounded-2xl animate-fade-in flex items-start gap-3"
            role="alert"
          >
            <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
            <div class="flex-1 font-medium leading-snug">
              {{ errorMsg }}
            </div>
            <button 
              type="button" 
              class="btn btn-ghost btn-xs btn-circle text-error-content/80 hover:text-error-content"
              @click="errorMsg = ''"
            >
              ✕
            </button>
          </div>

          <!-- Alerta de Éxito -->
          <div 
            v-if="successMsg" 
            class="alert alert-success mb-5 text-sm shadow-sm rounded-2xl animate-fade-in flex items-start gap-3"
            role="alert"
          >
            <CheckCircle2 class="w-5 h-5 shrink-0 mt-0.5" />
            <div class="flex-1 font-semibold leading-snug">
              {{ successMsg }}
            </div>
          </div>

          <!-- Formulario de Login -->
          <form @submit.prevent="handleLogin">
            <div class="flex flex-col gap-4">
              
              <!-- Campo Email -->
              <div>
                <label class="label pb-1.5" for="login-email">
                  <span class="label-text font-bold text-sm text-base-content flex items-center gap-1.5">
                    <Mail class="w-4 h-4 text-base-content/60" />
                    Correo Electrónico
                  </span>
                </label>
                <input 
                  id="login-email"
                  v-model="email" 
                  type="email" 
                  autocomplete="email"
                  class="input input-bordered w-full h-12 text-base bg-base-200/50 border-2 border-base-300 focus:border-primary rounded-xl" 
                  placeholder="tu@email.com" 
                  :disabled="cargando || Boolean(successMsg)"
                  required 
                />
              </div>
              
              <!-- Campo Contraseña -->
              <div>
                <label class="label pb-1.5" for="login-password">
                  <span class="label-text font-bold text-sm text-base-content flex items-center gap-1.5">
                    <Lock class="w-4 h-4 text-base-content/60" />
                    Contraseña
                  </span>
                </label>
                <div class="relative">
                  <input 
                    id="login-password"
                    v-model="password" 
                    :type="mostrarPassword ? 'text' : 'password'" 
                    autocomplete="current-password"
                    class="input input-bordered w-full h-12 text-base pr-12 bg-base-200/50 border-2 border-base-300 focus:border-primary rounded-xl" 
                    placeholder="••••••••" 
                    :disabled="cargando || Boolean(successMsg)"
                    required 
                  />
                  <button 
                    type="button" 
                    class="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
                    :disabled="cargando || Boolean(successMsg)"
                    @click="mostrarPassword = !mostrarPassword"
                    tabindex="-1"
                  >
                    <EyeOff v-if="mostrarPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <!-- Enlaces Rápidos -->
              <div class="flex items-center justify-between text-xs sm:text-sm mt-1">
                <NuxtLink 
                  to="/recuperar-password" 
                  class="link link-hover font-medium text-base-content/70 hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </NuxtLink>
                <NuxtLink 
                  to="/register" 
                  class="link link-hover font-bold text-primary hover:underline transition-colors"
                >
                  Regístrate aquí
                </NuxtLink>
              </div>
              
              <!-- Botón de Ingreso -->
              <button 
                type="submit" 
                class="btn btn-primary btn-lg mt-4 w-full font-black text-base shadow-md rounded-2xl gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                :disabled="cargando || Boolean(successMsg)"
              >
                <span v-if="cargando" class="loading loading-spinner loading-md"></span>
                <span v-if="successMsg">Redirigiendo...</span>
                <span v-else-if="cargando">Iniciando sesión...</span>
                <span v-else class="flex items-center gap-2">
                  <LogIn class="w-5 h-5" />
                  Ingresar al Sistema
                </span>
              </button>

            </div>
          </form>

        </div>
      </div>
      
    </div>

    <!-- Toast Flotante para Notificaciones Inmediatas -->
    <div v-if="toastMsg" class="toast toast-end toast-bottom z-50 p-4">
      <div 
        class="alert font-bold text-sm shadow-2xl rounded-2xl flex items-center gap-3 border"
        :class="toastType === 'error' ? 'alert-error border-error/30' : 'alert-success border-success/30'"
      >
        <AlertCircle v-if="toastType === 'error'" class="w-5 h-5 shrink-0" />
        <CheckCircle2 v-else class="w-5 h-5 shrink-0" />
        <span>{{ toastMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useAuthUser } from '~/composables/useAuthUser'

definePageMeta({
  layout: 'blank'
})

const supabase = useSupabaseClient()
const route = useRoute()
const { fetchColaborador, esAdmin, colaborador } = useAuthUser()

const email = ref('')
const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const toastMsg = ref('')
const toastType = ref<'success' | 'error'>('success')

let toastTimeout: NodeJS.Timeout | null = null

const mostrarToast = (mensaje: string, tipo: 'success' | 'error' = 'success', duracionMs = 4000) => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMsg.value = mensaje
  toastType.value = tipo
  toastTimeout = setTimeout(() => {
    toastMsg.value = ''
  }, duracionMs)
}

onMounted(() => {
  if (route.query.error === 'pending') {
    errorMsg.value = 'Tu cuenta está registrada pero pendiente de aprobación por un administrador.'
    mostrarToast('Cuenta pendiente de aprobación', 'error')
  } else if (route.query.error === 'unauthorized') {
    errorMsg.value = 'No tienes permisos suficientes para acceder a esa sección.'
    mostrarToast('Acceso no autorizado', 'error')
  } else if (route.query.message === 'registered') {
    successMsg.value = '¡Cuenta creada! Un administrador debe aprobar tu acceso antes de que puedas ingresar.'
    mostrarToast('Cuenta creada con éxito', 'success')
  }
})

const handleLogin = async () => {
  errorMsg.value = ''
  successMsg.value = ''
  cargando.value = true
  
  const emailLimpio = email.value.trim()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password: password.value,
    })
    
    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        errorMsg.value = 'Correo electrónico o contraseña incorrectos. Por favor verifica tus datos e intenta de nuevo.'
      } else if (msg.includes('email not confirmed')) {
        errorMsg.value = 'Tu correo electrónico no ha sido confirmado. Revisa tu bandeja de entrada.'
      } else if (msg.includes('too many requests')) {
        errorMsg.value = 'Demasiados intentos fallidos. Por favor espera unos momentos antes de intentar nuevamente.'
      } else {
        errorMsg.value = `Error al iniciar sesión: ${error.message}`
      }
      mostrarToast(errorMsg.value, 'error')
      cargando.value = false
      return
    }

    if (!data?.user) {
      errorMsg.value = 'No se pudo obtener la sesión del usuario. Intenta de nuevo.'
      mostrarToast(errorMsg.value, 'error')
      cargando.value = false
      return
    }

    // Sincronizar el usuario en el ref de Nuxt
    const userRef = useSupabaseUser()
    userRef.value = data.user

    // Consultar el perfil de colaborador
    const colabData = await fetchColaborador(data.user.id)

    // Verificar si la cuenta está aprobada
    if (colabData && colabData.aprobado === false) {
      await supabase.auth.signOut()
      userRef.value = null
      colaborador.value = null
      errorMsg.value = 'Tu cuenta está pendiente de aprobación por un administrador. No puedes ingresar hasta que sea autorizada.'
      mostrarToast(errorMsg.value, 'error', 5000)
      cargando.value = false
      return
    }

    // Notificar éxito
    const nombreUsuario = colabData?.nombre ? ` ${colabData.nombre}` : ''
    successMsg.value = `¡Bienvenido${nombreUsuario}! Inicio de sesión exitoso. Redirigiendo a tu panel...`
    mostrarToast(`¡Bienvenido${nombreUsuario}!`, 'success', 3000)

    // Determinar la ruta correspondiente
    let targetPath = '/'
    const redirectParam = route.query.redirect
    if (
      typeof redirectParam === 'string' && 
      redirectParam.startsWith('/') && 
      !redirectParam.startsWith('/login')
    ) {
      targetPath = redirectParam
    } else if (esAdmin.value) {
      targetPath = '/admin'
    } else {
      targetPath = '/'
    }

    // Esperar un breve instante para mostrar la animación de éxito y redirigir
    setTimeout(async () => {
      await navigateTo(targetPath)
    }, 600)

  } catch (err: any) {
    console.error('Error inesperado durante el login:', err)
    errorMsg.value = 'Ocurrió un error inesperado al iniciar sesión. Por favor intenta de nuevo.'
    mostrarToast(errorMsg.value, 'error')
    cargando.value = false
  }
}
</script>

