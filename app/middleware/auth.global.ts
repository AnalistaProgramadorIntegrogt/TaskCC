export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const { fetchColaborador, colaborador, esAdmin } = useAuthUser()

  // Si user.value aún no está sincronizado en el ref, verificar sesión en Supabase
  if (!user.value) {
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        user.value = data.session.user
      }
    } catch (e) {
      console.warn('Error al verificar sesión en middleware global:', e)
    }
  }

  // Rutas públicas que no requieren estar logueado
  const publicRoutes = ['/login', '/register', '/recuperar-password', '/actualizar-password']
  
  if (publicRoutes.includes(to.path)) {
    // Si ya tiene sesión activa, lo redirigimos a su panel correspondiente (excepto si está cambiando contraseña)
    if (user.value && to.path !== '/actualizar-password') {
      if (colaborador.value === null) {
        await fetchColaborador()
      }
      return navigateTo(esAdmin.value ? '/admin' : '/')
    }
    return
  }

  // Rutas protegidas (todas las demás)
  if (!user.value) {
    const redirectQuery = to.fullPath && to.fullPath !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirectQuery}`)
  }

  // Esperar a tener la información del colaborador
  if (colaborador.value === null) {
    await fetchColaborador()
  }

  // Verificar si la cuenta está aprobada
  if (colaborador.value && colaborador.value.aprobado === false) {
    await supabase.auth.signOut()
    user.value = null
    colaborador.value = null
    return navigateTo('/login?error=pending')
  }
})

