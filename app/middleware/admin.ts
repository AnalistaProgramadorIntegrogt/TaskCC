import { useAuthUser } from '~/composables/useAuthUser'
import { useVistasUsuario } from '~/composables/useVistasUsuario'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { fetchColaborador, colaborador, esAdmin } = useAuthUser()
  const { fetchVistas, tieneAcceso, cargandoVistas } = useVistasUsuario()
  const user = useSupabaseUser()

  if (!user.value) {
    const redirectQuery = to.fullPath ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirectQuery}`)
  }

  // Esperar a tener la información del colaborador si no está cargada
  if (colaborador.value === null) {
    await fetchColaborador()
  }

  // Si la cuenta no está aprobada, no permitir acceso
  if (colaborador.value && colaborador.value.aprobado === false) {
    return navigateTo('/login?error=pending')
  }

  // Si es ADMIN, tiene acceso total a cualquier ruta
  if (esAdmin.value) {
    return
  }

  // El Panel General (/admin) es accesible para todos los roles asignados
  const cleanPath = to.path.replace(/\/+$/, '') || '/'
  if (cleanPath === '/admin' || cleanPath === '/') {
    return
  }

  // Cargar vistas si aún no están listas
  if (cargandoVistas.value) {
    await fetchVistas()
  }

  // Validar si el rol del usuario tiene asignada la vista actual
  if (!tieneAcceso(to.path)) {
    console.warn(`[Seguridad] Acceso denegado a la ruta ${to.path} para el rol actual.`)
    return navigateTo('/admin')
  }
})
