'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Trend from '@/components/Trend';
import { sb, DEVICE } from '@/lib/supabase';

const RANGES = [
  { key: '1h', label: '1 jam', ms: 3600e3, bucket: 10 },
  { key: '24h', label: '24 jam', ms: 24 * 3600e3, bucket: 120 },
  { key: '7d', label: '7 hari', ms: 7 * 24 * 3600e3, bucket: 900 },
];
type P = { ts: string; level_pct: number | null; setpoint_pct: number | null; pump_pwm_pct: number | null; gas_adc: number | null; esd: number };

export default function TrendPage() {
  const [r, setR] = useState(RANGES[0]);
  const [data, setData] = useState<P[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setBusy(true);
    const to = new Date(), from = new Date(to.getTime() - r.ms);
    // rata-rata per bucket dihitung di database (fungsi trend), supaya 7 hari tetap ringan
    sb().rpc('trend', { p_device: DEVICE, p_from: from.toISOString(), p_to: to.toISOString(), p_bucket_s: r.bucket })
      .then(({ data }) => { setData((data as P[]) || []); setBusy(false); });
  }, [r]);
  const pts = data.map((d) => ({ ...d, t: Date.parse(d.ts) }));
  function csv() {
    const head = 'waktu,level_pct,setpoint_pct,pump_pwm_pct,gas_adc,esd\n';
    const body = data.map((d) => [d.ts, d.level_pct, d.setpoint_pct, d.pump_pwm_pct, d.gas_adc, d.esd].join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }));
    a.download = `trend_${DEVICE}_${r.key}.csv`; a.click();
  }
  const gasMax = Math.max(1000, ...data.map((d) => d.gas_adc || 0));
  return (
    <Shell>
      <section className="panel">
        <div className="row-between">
          <h2>Trend historis {busy ? <span className="muted small">memuat...</span> : null}</h2>
          <div className="tabs">{RANGES.map((x) => <button key={x.key} className={x.key === r.key ? 'on' : ''} onClick={() => setR(x)}>{x.label}</button>)}
            <button onClick={csv} disabled={!data.length}>Export CSV</button></div>
        </div>
        <Trend refs={[{ v: 90, label: 'HH 90', color: '#b91c1c' }, { v: 15, label: 'LL 15', color: '#6d28d9' }]} series={[
          { name: 'Level LT-101', color: '#1e3a5f', points: pts.map((d) => ({ t: d.t, v: d.level_pct })) },
          { name: 'Setpoint', color: '#d97706', dash: true, points: pts.map((d) => ({ t: d.t, v: d.setpoint_pct })) },
          { name: 'PWM P-101', color: '#16a34a', points: pts.map((d) => ({ t: d.t, v: d.pump_pwm_pct })) },
        ]} />
        <h2>Gas AT-101</h2>
        <Trend unit="ADC" yMin={0} yMax={Math.ceil(gasMax / 500) * 500} height={180} series={[
          { name: 'Gas AT-101', color: '#a16207', points: pts.map((d) => ({ t: d.t, v: d.gas_adc })) },
        ]} />
        <p className="muted small">Tiap titik adalah rata-rata {r.bucket} detik.</p>
      </section>
    </Shell>
  );
}
