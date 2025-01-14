import { createClient } from '@supabase/supabase-js'

const supabaseURL = process.env.SUPABASE_API_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseURL, supabaseKey)

export default supabase