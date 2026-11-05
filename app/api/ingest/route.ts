// POST /api/ingest : dipanggil ESP32 tiap 2 detik
// Header: x-device-id, x-device-key.  Balasan berisi setpoint dan gain PID terbaru.
import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { admin } from '@/lib/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null);

export async function POST(req: NextRequest) {
  const supa = admin();
  const id = req.headers.get('x-device-id') ?? '';
  const key = req.headers.get('x-device-key') ?? '';
  if (!id || !key) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { data: dev } = await supa.from('devices').select('id, key_hash').eq('id', id).maybeSingle();
  const hash = createHash('sha256').update(key).digest('hex');
  if (!dev || dev.key_hash.length !== hash.length || !timingSafeEqual(Buffer.from(dev.key_hash), Buffer.from(hash))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  const now = Date.now();
  const tsOf = (msAgo: unknown) => new Date(now - Math.max(0, Math.min(Number(msAgo) || 0, 3_600_000))).toISOString();
  const fw = str(body.fw, 16);

  const rows = (Array.isArray(body.samples) ? body.samples.slice(0, 200) : []).map((s: any) => ({
    device_id: id, ts: tsOf(s.ms_ago), fw,
    level_pct: num(s.level_pct), distance_cm: num(s.distance_cm), setpoint_pct: num(s.setpoint_pct),
    pump_pwm_pct: num(s.pump_pwm_pct), gas_adc: num(s.gas_adc), leak_adc: num(s.leak_adc),
    leak: !!s.leak, esd_active: !!s.esd_active, esd_cause: str(s.esd_cause, 16), state: str(s.state, 16), rssi: num(s.rssi),
  }));
  const evRows = (Array.isArray(body.events) ? body.events.slice(0, 50) : []).map((e: any) => ({
    device_id: id, ts: tsOf(e.ms_ago), tag: str(e.tag, 16) ?? '?', kind: str(e.kind, 16) ?? '?',
    priority: str(e.priority, 16) ?? 'INFO', state: str(e.state, 16) ?? 'ACTIVE', value: num(e.value), message: str(e.message, 120),
  }));

  if (rows.length) {
    const { error } = await supa.from('telemetry').insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (evRows.length) {
    const { error } = await supa.from('alarm_events').insert(evRows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const { data: config } = await supa.from('device_config').select('setpoint_pct, kp, ki, kd').eq('device_id', id).maybeSingle();
  return NextResponse.json({ ok: true, saved: rows.length, events: evRows.length, config });
}
