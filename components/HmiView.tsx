'use client';
import Link from 'next/link';
import Shell from '@/components/Shell';
import Trend from '@/components/Trend';
import HmiMimic from '@/components/HmiMimic';
import { fmtTime } from '@/lib/live';
import type { Row, AlarmEvent } from '@/lib/supabase';

const STATE_TXT: Record<string, string> = {
  NORMAL: 'NORMAL', WARMUP: 'PEMANASAN MQ-2', ALARM: 'ALARM', ESD: 'ESD TRIP', FAULT: 'FAULT SENSOR', OFFLINE: 'OFFLINE',
};

// Tampilan dipisah dari pengambilan data supaya bisa diuji dengan data contoh.
export default function HmiView({ last, offline, alarms, recent, now, noShell }:
  { last?: Row; offline: boolean; alarms: AlarmEvent[]; recent: (Row & { t: number })[]; now: number; noShell?: boolean }) {
  const state = offline ? 'OFFLINE' : last?.state || 'NORMAL';
  const head = alarms[0];
  const unacked = alarms.filter((a) => !a.acked_at).length;
  const v = (x: number | null | undefined, n = 1) => (offline || x == null ? '---' : x.toFixed(n));
  const body = (
    <div className="hmi">
      {/* baris status */}
      <div className="hmi-status">
        <span className="hs-unit">UNIT T-101 · TANK LEVEL &amp; ESD</span>
        <span className={`hs-chip st-${STATE_TXT[state] ? state : 'OFFLINE'}`}>{STATE_TXT[state] ?? state}</span>
        <span className="hs-item">Kontrol <b>{offline ? '---' : last?.esd_active ? 'ESD' : 'AUTO'}</b></span>
        <span className="hs-item">Data <b>{last ? fmtTime(last.ts) : '-'}</b></span>
        <span className="hs-item">RSSI <b>{offline || last?.rssi == null ? '---' : `${last.rssi} dBm`}</b></span>
        <span className="hs-item">FW <b>{last?.fw ?? '-'}</b></span>
        <span className="hs-clock">{new Date(now).toLocaleTimeString('id-ID', { hour12: false })}</span>
      </div>

      {/* banner alarm teratas */}
      <Link href="/alarms" className={head ? `hmi-alarmbar ab-${head.priority}` : 'hmi-alarmbar ab-none'}>
        {head ? (<>
          <b>{head.priority}</b><span>{fmtTime(head.ts)}</span><span>{head.tag}</span><span>{head.message}</span>
          <span className="ab-count">{alarms.length} aktif · {unacked} belum ACK</span>
        </>) : <span>Tidak ada alarm aktif</span>}
      </Link>

      <div className="hmi-grid">
        <section className="hmi-panel mimic-wrap">
          <HmiMimic d={last} offline={offline} alarms={alarms} now={now} />
        </section>

        <aside className="hmi-side">
          <section className="hmi-panel">
            <h3>Faceplate LIC-101</h3>
            <div className="fp">
              <Bar label="PV" val={offline ? null : last?.level_pct ?? null} cls="pv" />
              <Bar label="SP" val={last?.setpoint_pct ?? null} cls="sp" />
              <Bar label="OUT" val={offline ? null : last?.pump_pwm_pct ?? null} cls="out" />
            </div>
            <table className="fp-tbl"><tbody>
              <tr><td>PV level</td><td>{v(last?.level_pct)} %</td></tr>
              <tr><td>SP</td><td>{last?.setpoint_pct == null ? '---' : last.setpoint_pct.toFixed(0)} %</td></tr>
              <tr><td>OUT P-101</td><td>{v(last?.pump_pwm_pct, 0)} %</td></tr>
              <tr><td>Jarak LT-101</td><td>{v(last?.distance_cm)} cm</td></tr>
            </tbody></table>
            <Link href="/setpoint" className="hmi-btn">Ubah setpoint / tuning</Link>
          </section>

          <section className="hmi-panel">
            <h3>Alarm aktif ({alarms.length})</h3>
            {alarms.length === 0 ? <div className="muted small">Semua normal.</div> : (
              <ul className="al-list">
                {alarms.slice(0, 6).map((a) => (
                  <li key={a.id} className={a.acked_at ? 'acked' : ''}>
                    <i className={`pm pm-${a.priority}`} />
                    <span className="al-tag">{a.tag} {a.kind}</span>
                    <span className="al-msg">{a.message}</span>
                    <span className="al-t">{fmtTime(a.ts)}</span>
                  </li>))}
              </ul>)}
            <Link href="/alarms" className="hmi-btn">Buka daftar alarm / ACK</Link>
          </section>
        </aside>
      </div>

      <section className="hmi-panel">
        <div className="row-between"><h3>Trend 10 menit · LT-101, SP, OUT</h3><Link href="/trend" className="small">trend historis</Link></div>
        <Trend height={200} refs={[{ v: 90, label: 'HH 90', color: '#d0021b' }, { v: 15, label: 'LL 15', color: '#6d28d9' }]}
          series={[
            { name: 'Level LT-101', color: '#1f3b63', points: recent.map((r) => ({ t: r.t, v: r.level_pct })) },
            { name: 'Setpoint', color: '#b45309', dash: true, points: recent.map((r) => ({ t: r.t, v: r.setpoint_pct })) },
            { name: 'OUT P-101', color: '#15803d', points: recent.map((r) => ({ t: r.t, v: r.pump_pwm_pct })) },
          ]} />
      </section>
    </div>
  );
  return noShell ? body : <Shell>{body}</Shell>;
}

function Bar({ label, val, cls }: { label: string; val: number | null; cls: string }) {
  const p = val == null ? 0 : Math.max(0, Math.min(100, val));
  return (
    <div className="fp-col">
      <div className="fp-bar">
        <div className={`fp-fill ${cls}`} style={{ height: `${p}%` }} />
        {label === 'PV' && [90, 80, 25, 15].map((m) => <div key={m} className="fp-mark" style={{ bottom: `${m}%` }} />)}
      </div>
      <div className="fp-val">{val == null ? '---' : val.toFixed(0)}</div>
      <div className="fp-lbl">{label}</div>
    </div>
  );
}
