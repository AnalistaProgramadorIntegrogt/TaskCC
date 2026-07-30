import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uvuiznjvhxvxgtnvgtfc.supabase.co'
const supabaseKey = 'sb_publishable_tO_4f7Bgc-xhWgCtyRNTZw_HtGImyz0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data: roles, error: rolesError } = await supabase.from('roles').select('*')
  console.log("Roles table:", roles, rolesError)
}

test()
