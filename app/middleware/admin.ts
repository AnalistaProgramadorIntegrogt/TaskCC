export default defineNuxtRouteMiddleware(async (to, from) => {
  const { fetchColaborador, colaborador, esAdmin } = useAuthUser()
  const user = useSupabaseUser()

  if (!user.value) {
    const redirectQuery = to.fullPath ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirectQuery}`)
  }

  // Esperar a tener la información del colaborador si no está cargada
  if (colaborador.value === null) {
    await fetchColaborador()
  }

  if (!esAdmin.value) {
    return navigateTo('/')
  }
})

