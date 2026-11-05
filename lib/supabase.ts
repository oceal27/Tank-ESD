import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Client untuk browser (pakai anon key + login user, dibatasi RLS)
export function sb(): SupabaseClient {
  if (!client) client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  return client;
}

export const DEVICE = process.env.NEXT_PUBLIC_DEVICE_ID || 'tank-01';

export type Row = {
  id: number; ts: string; level_pct: number | null; distance_cm: number | null; setpoint_pct: number | null;
  pump_pwm_pct: number | null; gas_adc: number | null; leak_adc: number | null; leak: boolean;
  esd_active: boolean; esd_cause: string | null; state: string | null; rssi: number | null; fw: string | null;
};

export type AlarmEvent = {
  id: number; ts: string; tag: string; kind: string; priority: string; state: string;
  value: number | null; message: string | null; acked_by: string | null; acked_at: string | null;
};
