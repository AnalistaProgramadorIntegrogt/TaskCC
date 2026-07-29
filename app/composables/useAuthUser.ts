export const useAuthUser = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const colaborador = useState('colaborador', () => null)
  const isCargando = useState('colaborador_cargando', () => false)

  const fetchColaborador = async () => {
    if (!user.value) {
      colaborador.value = null
      return
    }
    
    isCargando.value = true
    try {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*, roles(rol)')
        .eq('auth_id', user.value.id)
        .single()
        
      if (!error && data) {
        colaborador.value = data
      } else {
        colaborador.value = null
      }
    } catch (e) {
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
    fetchColaborador
  }
}
