'use client';
import Link from 'next/link';
import Shell from '@/components/Shell';
import StateBanner from '@/components/StateBanner';
import Trend from '@/components/Trend';
import TankGauge from '@/components/TankGauge';
import { useTelemetry, useNow, useAlarms, activeAlarms, fmtTime } from '@/lib/live';

export default function Dashboard() {
  const rows = useTelemetry(400);
  const { rows: alarms } = useAlarms(100);
  const now = useNow();
  const last = rows.at(-1);
  const offline = !last || now - Date.parse(last.ts) > 10000;
  const state = offline ? 'OFFLINE' : last.state || 'NORMAL';
  const recent = rows.filter((r) => Date.parse(r.ts) > now - 10 * 60e3).map((r) => ({ ...r, t: Date.parse(r.ts) }));
  const act = activeAlarms(alarms);
  const v = (x: number | null | undefined, d = 1) => (x == null ? '---' : x.toFixed(d));
  return (
    <Shell>
      <StateBanner state={state} cause={last?.esd_cause} />
      <div className="grid-main">
        <section className="panel">
          <h2>Tangki T-101</h2>
          <TankGauge level={offline ? null : last?.level_pct ?? null} sp={last?.setpoint_pct ?? null} esd={!!last?.esd_active} />
          <div className="muted small center-t">Data terakhir: {last ? fmtTime(last.ts) : '-'}</div>
        </section>
        <section className="cards">
          <Card tag="LT-101" name="Level" val={v(last?.level_pct)} unit="%" note={`jarak ${v(last?.distance_cm)} cm`} />
          <Card tag="LIC-101" name="Setpoint" val={v(last?.setpoint_pct, 0)} unit="%" note="ubah di halaman Setpoint" />
          <Card tag="P-101" name="Pompa" val={!last ? '---' : last.pump_pwm_pct ? v(last.pump_pwm_pct, 0) : 'OFF'} unit={last && last.pump_pwm_pct ? '% PWM' : ''} note="via L298N" />
          <Card tag="AT-101" name="Gas" val={last?.gas_adc != null ? String(last.gas_adc) : '---'} unit="ADC" note="MQ-2" />
          <Card tag="LSH-102" name="Baki" val={last ? (last.leak ? 'BASAH' : 'KERING') : '---'} unit="" bad={!!last?.leak} note={`ADC ${last?.leak_adc ?? '-'}`} />
          <Card tag="UZ-101" name="ESD" val={last ? (last.esd_active ? 'AKTIF' : 'AMAN') : '---'} unit="" bad={!!last?.esd_active} note={last?.esd_cause ? `penyebab ${last.esd_cause}` : 'logika di ESP32'} />
        </section>
      </div>
      <section className="panel">
        <div className="row-between"><h2>Trend 10 menit terakhir</h2>
          <Link href="/alarms" className={act.length ? 'pill pill-bad' : 'pill'}>{act.length} alarm aktif</Link></div>
        <Trend refs={[{ v: 90, label: 'HH 90', color: '#b91c1c' }, { v: 15, label: 'LL 15', color: '#6d28d9' }]}
          series={[
            { name: 'Level LT-101', color: '#1e3a5f', points: recent.map((r) => ({ t: r.t, v: r.level_pct })) },
            { name: 'Setpoint', color: '#d97706', dash: true, points: recent.map((r) => ({ t: r.t, v: r.setpoint_pct })) },
            { name: 'PWM P-101', color: '#16a34a', points: recent.map((r) => ({ t: r.t, v: r.pump_pwm_pct })) },
          ]} />
      </section>
    </Shell>
  );
}

function Card({ tag, name, val, unit, note, bad }: { tag: string; name: string; val: string; unit: string; note?: string; bad?: boolean }) {
  return (
    <div className={bad ? 'card bad' : 'card'}>
      <div className="card-tag">{tag} <span>{name}</span></div>
      <div className="card-val">{val} <small>{unit}</small></div>
      {note && <div className="muted small">{note}</div>}
    </div>
  );
}
