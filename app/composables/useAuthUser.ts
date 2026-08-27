import { computed, watch } from 'vue'

export const useAuthUser = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const colaborador = useState<any>('colaborador', () => null)
  const isCargando = useState<boolean>('colaborador_cargando', () => false)
  const authError = useState<any>('colaborador_error', () => null)

  const esAdmin = computed(() => {
    if (!colaborador.value) return false
    const rol = colaborador.value.roles?.rol
    if (rol === 'ADMIN') return true
    if (Array.isArray(colaborador.value.roles) && colaborador.value.roles.some((r: any) => r.rol === 'ADMIN')) return true
    return colaborador.value.rol_id === 1 || colaborador.value.rol_id === 2
  })

  const fetchColaborador = async (explicitUserId?: string) => {
    authError.value = null
    let userId = explicitUserId || user.value?.id || (user.value as any)?.sub

    if (!userId) {
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user?.id) {
          userId = data.user.id
          if (!user.value) {
            user.value = data.user
          }
        }
      } catch (e) {
        console.warn('No se pudo obtener el usuario de Supabase auth:', e)
      }
    }

    if (!userId) {
      colaborador.value = null
      authError.value = 'User is null or missing ID/SUB'
      return null
    }
    
    isCargando.value = true
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*, roles(rol)')
        .eq('auth_id', userId)
        .single()
        
      if (!error && data) {
        colaborador.value = data
        return data
      } else {
        console.error('Error fetching colaborador:', error)
        authError.value = error
        colaborador.value = null
        return null
      }
    } catch (e) {
      console.error('Exception fetching colaborador:', e)
      authError.value = e
      colaborador.value = null
      return null
    } finally {
      isCargando.value = false
    }
  }

  // Si cambia el usuario de supabase, volvemos a obtener el colaborador
  watch(user, (newUser) => {
    if (newUser) {
      fetchColaborador()
    } else {
      colaborador.value = null
    }
  }, { immediate: true })

  return {
    user,
    colaborador,
    esAdmin,
    isCargando,
    authError,
    fetchColaborador
  }
}
