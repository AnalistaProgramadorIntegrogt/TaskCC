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

  // Rutas de autenticación que redirigen al panel si ya tiene sesión iniciada
  const authRoutes = ['/login', '/register', '/recuperar-password']
  if (authRoutes.includes(to.path)) {
    if (user.value) {
      if (colaborador.value === null) {
        await fetchColaborador()
      }
      return navigateTo(esAdmin.value ? '/admin' : '/')
    }
    return
  }

  // Rutas públicas permitidas sin forzar inicio de sesión (escaneo QR de tareas, actualización de contraseña)
  const isPublicRoute = 
    to.path === '/actualizar-password' || 
    to.path.startsWith('/scan/') || 
    to.path === '/scan'

  if (isPublicRoute) {
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
