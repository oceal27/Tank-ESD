import { createClient } from '@supabase/supabase-js';

// Client khusus server (API route). Service role key TIDAK PERNAH dikirim ke browser.
export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
