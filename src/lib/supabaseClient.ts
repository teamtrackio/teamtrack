/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev rather than silently returning empty data everywhere.
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values.'
  )
}

// Only the public anon key is ever used here. Never import or reference a
// service_role key in frontend code — see SECURITY notes in README.md.
//
// Note: this client is intentionally untyped against a generated Database
// schema (no `supabase gen types` step is part of this project's build).
// Query results are cast to the interfaces in src/types/database.ts at the
// service-layer boundary (src/services/*.ts) instead. For a project this
// size that's a reasonable trade-off; if you later run
// `supabase gen types typescript` yourself, you can pass that generated
// type here as createClient<Database>(...) for full end-to-end inference.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
