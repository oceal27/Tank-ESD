'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';

type Unit = { name: string; url: string };
type Status = { plant_unit?: string; device_id?: string; ts?: string; state?: string; esd_active?: boolean; esd_cause?: string | null; tags?: { tag: string; value: number | null; unit: string }[] };

function units(): Unit[] {
  const own = [{ name: 'Tank farm T-101 (kelompok kami)', url: '/api/status' }];
  try { return own.concat(JSON.parse(process.env.NEXT_PUBLIC_PLANT_UNITS || '[]')); } catch { return own; }
}

// Dashboard plant gabungan: memanggil /api/status tiap unit setiap 5 detik
export default function Plant() {
  const list = units();
  const [st, setSt] = useState<Record<string, Status | 'error'>>({});
  useEffect(() => {
    const load = () => list.forEach((u) => fetch(u.url, { cache: 'no-store' }).then((r) => r.json()).then((j) => setSt((s) => ({ ...s, [u.url]: j })))
      .catch(() => setSt((s) => ({ ...s, [u.url]: 'error' }))));
    load(); const t = setInterval(load, 5000); return () => clearInterval(t);
  }, []);
  return (
    <Shell>
      <section className="panel">
        <h2>Plant gabungan</h2>
        <div className="plant">{list.map((u) => {
          const s = st[u.url];
          const state = s === 'error' || !s ? 'OFFLINE' : s.state || 'OFFLINE';
          return (
            <div key={u.url} className={`unit u-${state}`}>
              <div className="unit-head"><b>{u.name}</b><span className={`prio s-${state}`}>{state}</span></div>
              {s && s !== 'error' && s.tags?.map((t) => <div key={t.tag} className="unit-row"><span>{t.tag}</span><b>{t.value ?? '-'} <small>{t.unit}</small></b></div>)}
              {s && s !== 'error' && s.esd_active && <div className="err">ESD: {s.esd_cause}</div>}
              {(s === 'error' || !s) && <div className="muted small">Tidak bisa dihubungi</div>}
            </div>);
        })}</div>
        <p className="muted small">Unit kelompok lain ditambahkan lewat variabel NEXT_PUBLIC_PLANT_UNITS di Vercel.</p>
      </section>
    </Shell>
  );
}
