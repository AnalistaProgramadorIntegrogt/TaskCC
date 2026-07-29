import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    
    // We try to fetch from a non-existent table to verify the database responds.
    // If the connection and API key are valid, we should get a specific Postgres error (code PGRST204)
    // rather than a connection timeout or a 401 Unauthorized error.
    const { data, error } = await supabase.from('_connection_test_').select('*').limit(1)
    
    return {
      success: true,
      message: 'Connection attempt finished.',
      supabaseResponse: error ? error : { data }
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'Failed to initialize connection.',
      error: err.message
    }
  }
})
