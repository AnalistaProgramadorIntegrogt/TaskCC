import { useVistasUsuario } from '~/composables/useVistasUsuario'
import { useAuthUser } from '~/composables/useAuthUser'

export function usePermisos() {
  const usuario = useSupabaseUser()
  const { colaborador, esAdmin } = useAuthUser()
  const { vistasAsignadas, tieneAcceso, rolActualNombre } = useVistasUsuario()

  function puede(permisoOIdentificador) {
    if (esAdmin.value) return true
    if (!permisoOIdentificador) return false
    return tieneAcceso(permisoOIdentificador)
  }

  return { 
    usuario, 
    colaborador,
    esAdmin,
    rolActualNombre,
    vistasAsignadas,
    tieneAcceso,
    puede 
  }
}
