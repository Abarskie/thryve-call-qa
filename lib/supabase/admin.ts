import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getSupabaseServerUrl } from '@/lib/supabase/url'

/**
 * Creates an administrative Supabase client using the service role key.
 * Bypasses RLS policies - strictly for server-side trusted operations (e.g. webhook handlers, background jobs).
 */
export function createAdminClient() {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-service-role-key'

  return createClient<Database>(
    getSupabaseServerUrl(),
    key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
