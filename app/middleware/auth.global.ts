export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const { fetchColaborador, colaborador } = useAuthUser()

  // Rutas públicas que no requieren estar logueado ni aprobado
  const publicRoutes = ['/login', '/register']
  
  if (publicRoutes.includes(to.path)) {
    // Si ya tiene sesión, lo mandamos al inicio (a menos que no esté aprobado, que igual lo mandará a /pendiente o donde decidamos)
    if (user.value) {
      // Necesitamos esperar que cargue el colaborador si es que no ha cargado
      if (colaborador.value === null) {
         await fetchColaborador()
      }
      if (colaborador.value?.aprobado) {
        return navigateTo('/')
      }
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

  // Verificar si está aprobado
  if (!colaborador.value?.aprobado) {
    // Si intenta ir a cualquier ruta protegida y no está aprobado, lo mandamos a login con un parámetro
    // O podríamos hacer una página de "pendiente", pero para simplificar lo mandamos al login con error
    if (to.path !== '/login') {
      return navigateTo('/login?error=pending')
    }
  }
})
