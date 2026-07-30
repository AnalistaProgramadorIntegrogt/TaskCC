export const useAuthUser = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const colaborador = useState('colaborador', () => null)
  const isCargando = useState('colaborador_cargando', () => false)
  const authError = useState('colaborador_error', () => null as any)

  const fetchColaborador = async () => {
    authError.value = null
    const userId = user.value?.id || user.value?.sub
    if (!userId) {
      colaborador.value = null
      authError.value = 'User is null or missing ID/SUB'
      return
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
      } else {
        console.error('Error fetching colaborador:', error)
        authError.value = error
        colaborador.value = null
      }
    } catch (e) {
      console.error('Exception fetching colaborador:', e)
      authError.value = e
      colaborador.value = null
    } finally {
      isCargando.value = false
    }
  }

  // Si cambia el usuario de supabase, volvemos a obtener el colaborador
  watch(user, () => {
    fetchColaborador()
  }, { immediate: true })

  return {
    user,
    colaborador,
    isCargando,
    authError,
    fetchColaborador
  }
}
