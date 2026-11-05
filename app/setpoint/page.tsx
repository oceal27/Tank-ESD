'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { sb, DEVICE } from '@/lib/supabase';
import { useTelemetry } from '@/lib/live';

export default function Setpoint() {
  const rows = useTelemetry(5);
  const last = rows.at(-1);
  const [f, setF] = useState({ setpoint_pct: '', kp: '', ki: '', kd: '' });
  const [msg, setMsg] = useState('');
  useEffect(() => {
    sb().from('device_config').select('*').eq('device_id', DEVICE).maybeSingle().then(({ data }) => {
      if (data) setF({ setpoint_pct: String(data.setpoint_pct), kp: String(data.kp), ki: String(data.ki), kd: String(data.kd) });
    });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg('');
    const val = { setpoint_pct: Number(f.setpoint_pct), kp: Number(f.kp), ki: Number(f.ki), kd: Number(f.kd) };
    if (Object.values(val).some((x) => !Number.isFinite(x))) return setMsg('Semua kolom harus angka.');
    if (val.setpoint_pct < 0 || val.setpoint_pct > 100) return setMsg('Setpoint harus 0 sampai 100 %.');
    const { data: u } = await sb().auth.getUser();
    const { error } = await sb().from('device_config').update({ ...val, updated_at: new Date().toISOString(), updated_by: u.user?.id }).eq('device_id', DEVICE);
    setMsg(error ? 'Gagal menyimpan: ' + error.message : 'Tersimpan. ESP32 akan memakai nilai baru dalam sekitar 2 detik.');
  }
  const inp = (k: keyof typeof f, label: string, step = '0.1') => (
    <label>{label}<input type="number" step={step} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>);
  return (
    <Shell>
      <section className="panel narrow">
        <h2>Setpoint dan tuning LIC-101</h2>
        <form onSubmit={save} className="form">
          {inp('setpoint_pct', 'Setpoint level (%)', '1')}
          {inp('kp', 'Kp')}{inp('ki', 'Ki (per detik)')}{inp('kd', 'Kd')}
          <button className="btn">Simpan</button>
        </form>
        {msg && <div className="note">{msg}</div>}
        <p className="muted small">Setpoint yang sedang dipakai ESP32: <b>{last?.setpoint_pct ?? '-'} %</b>. Setpoint di atas 90 % sengaja diizinkan untuk uji trip HH (skenario T3).</p>
      </section>
    </Shell>
  );
}
