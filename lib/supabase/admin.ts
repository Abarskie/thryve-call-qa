import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { getSupabaseServerUrl } from '@/lib/supabase/url'

/**
 * Creates an administrative Supabase client using the service role key.
 * Bypasses RLS policies - strictly for server-side trusted operations (e.g. webhook handlers, background jobs).
 */
export function createAdminClient() {
  return createClient<Database>(
    getSupabaseServerUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
