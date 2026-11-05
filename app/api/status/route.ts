// GET /api/status : status terakhir unit tangki, format bersama untuk dashboard plant gabungan
import { NextResponse } from 'next/server';
import { admin } from '@/lib/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const device = process.env.NEXT_PUBLIC_DEVICE_ID || 'tank-01';
  const { data: r, error } = await admin().from('v_latest').select('*').eq('device_id', device).maybeSingle();
  const cors = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
  if (error || !r) return NextResponse.json({ device_id: device, state: 'OFFLINE', tags: [] }, { headers: cors });
  const offline = Date.now() - new Date(r.ts).getTime() > 10_000;
  return NextResponse.json({
    plant_unit: r.plant_unit, device_id: r.device_id, ts: r.ts,
    state: offline ? 'OFFLINE' : r.state === 'WARMUP' ? 'NORMAL' : r.state,
    esd_active: r.esd_active, esd_cause: r.esd_cause,
    tags: [
      { tag: 'LT-101', value: r.level_pct, unit: '%' },
      { tag: 'LIC-101', value: r.setpoint_pct, unit: '% SP' },
      { tag: 'P-101', value: r.pump_pwm_pct, unit: '% PWM' },
      { tag: 'AT-101', value: r.gas_adc, unit: 'ADC' },
      { tag: 'LSH-102', value: r.leak ? 1 : 0, unit: '0 kering / 1 basah' },
    ],
  }, { headers: cors });
}
