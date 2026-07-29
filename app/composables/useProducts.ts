export const useProducts = () => {
  const supabase = useSupabaseClient()

  // Fetch products from 'products' table
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('Error fetching products:', error.message)
      return []
    }

    return data
  }

  return {
    fetchProducts
  }
}
