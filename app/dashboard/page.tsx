'use client';
import HmiView from '@/components/HmiView';
import { useTelemetry, useNow, useAlarms, activeAlarms } from '@/lib/live';

// Dashboard utama: tampilan HMI proses T-101 (data live dari Supabase)
export default function Dashboard() {
  const rows = useTelemetry(400);
  const { rows: alarms } = useAlarms(100);
  const now = useNow(500);
  const last = rows.at(-1);
  const offline = !last || now - Date.parse(last.ts) > 10000;
  const recent = rows.filter((r) => Date.parse(r.ts) > now - 10 * 60e3).map((r) => ({ ...r, t: Date.parse(r.ts) }));
  return <HmiView last={last} offline={offline} alarms={activeAlarms(alarms)} recent={recent} now={now} />;
}
