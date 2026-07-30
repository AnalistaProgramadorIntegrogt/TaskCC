export default defineNuxtRouteMiddleware(async (to, from) => {
  const { fetchColaborador, colaborador } = useAuthUser()
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }

  // Esperar a tener la información del colaborador si no está cargada
  if (colaborador.value === null) {
    await fetchColaborador()
  }

  // Verificar que el usuario tenga rol de ADMIN
  // El ID 1 es ADMIN y 2 es USER por defecto.
  const isUserAdmin = 
    colaborador.value?.roles?.rol === 'ADMIN' || 
    (Array.isArray(colaborador.value?.roles) && colaborador.value.roles.some((r: any) => r.rol === 'ADMIN')) ||
    colaborador.value?.rol_id === 2; // (Actualmente configurado como 2 para pruebas del usuario)

  if (!isUserAdmin) {
    return navigateTo('/')
  }
})
