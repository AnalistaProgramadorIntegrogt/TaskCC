export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const { fetchColaborador, colaborador } = useAuthUser()

  // Rutas públicas que no requieren estar logueado ni aprobado
  const publicRoutes = ['/login', '/register', '/recuperar-password', '/actualizar-password']
  
  if (publicRoutes.includes(to.path)) {
    // Si ya tiene sesión, lo mandamos al inicio (excepto si está en pleno flujo de resetear password)
    if (user.value && to.path !== '/actualizar-password') {
      return navigateTo('/')
    }
    return
  }

  // Rutas protegidas (todas las demás)
  if (!user.value) {
    return navigateTo('/login')
  }

  // Esperar a tener la información del colaborador si acaba de loguearse
  if (colaborador.value === null) {
    await fetchColaborador()
  }

  // (Temporalmente deshabilitado) Verificar si está aprobado
  /*
  if (!colaborador.value?.aprobado) {
    if (to.path !== '/login') {
      return navigateTo('/login?error=pending')
    }
  }
  */
})
