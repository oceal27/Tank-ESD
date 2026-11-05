'use client';
import { useEffect, useRef } from 'react';
import Shell from '@/components/Shell';
import { sb } from '@/lib/supabase';
import { useAlarms, activeAlarms, fmtDateTime } from '@/lib/live';

export default function Alarms() {
  const { rows, reload } = useAlarms(200);
  const act = activeAlarms(rows);
  const unackedCritical = act.some((a) => a.priority === 'CRITICAL' && !a.acked_at);
  const audio = useRef<AudioContext | null>(null);

  // Bunyi beep di browser selama ada alarm CRITICAL yang belum di-ACK
  useEffect(() => {
    if (!unackedCritical) return;
    const t = setInterval(() => {
      try {
        audio.current = audio.current || new AudioContext();
        const ctx = audio.current, o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 1100; g.gain.value = 0.05; o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.15);
      } catch { /* browser memblokir audio sebelum ada klik */ }
    }, 1500);
    return () => clearInterval(t);
  }, [unackedCritical]);

  async function ack(id: number) {
    await sb().rpc('ack_alarm', { p_id: id });
    reload();
  }

  return (
    <Shell>
      <section className="panel">
        <h2>Alarm aktif ({act.length})</h2>
        {act.length === 0 ? <div className="empty">Tidak ada alarm aktif.</div> : (
          <table className="tbl">
            <thead><tr><th>Prioritas</th><th>Waktu</th><th>Tag</th><th>Jenis</th><th>Nilai</th><th>Pesan</th><th>ACK</th></tr></thead>
            <tbody>{act.map((a) => (
              <tr key={a.id}><td><span className={`prio p-${a.priority}`}>{a.priority}</span></td><td>{fmtDateTime(a.ts)}</td><td>{a.tag}</td><td>{a.kind}</td>
                <td>{a.value?.toFixed?.(1) ?? '-'}</td><td>{a.message}</td>
                <td>{a.acked_at ? <span className="muted small">sudah</span> : <button className="btn small" onClick={() => ack(a.id)}>ACK</button>}</td></tr>))}
            </tbody>
          </table>)}
        <p className="muted small">ACK hanya menandai alarm sudah dilihat operator. ESD tetap terkunci sampai tombol RESET fisik ditekan.</p>
      </section>
      <section className="panel">
        <h2>Riwayat kejadian</h2>
        <table className="tbl">
          <thead><tr><th>Waktu</th><th>Tag</th><th>Jenis</th><th>Prioritas</th><th>Status</th><th>Nilai</th><th>Pesan</th></tr></thead>
          <tbody>{rows.map((a) => (
            <tr key={a.id}><td>{fmtDateTime(a.ts)}</td><td>{a.tag}</td><td>{a.kind}</td><td><span className={`prio p-${a.priority}`}>{a.priority}</span></td>
              <td>{a.state}</td><td>{a.value?.toFixed?.(1) ?? '-'}</td><td>{a.message}</td></tr>))}
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
