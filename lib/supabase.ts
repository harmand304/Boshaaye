import { createClient as supabaseCreateClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client using the public anon key.
 * No auth is needed for this app (MVP), so this is safe to use
 * in both server components and client components.
 */
export function createClient() {
  return supabaseCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
