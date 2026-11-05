// Grafik garis sederhana berbasis SVG (tanpa library tambahan)
type Pt = { t: number; v: number | null };
type Series = { name: string; color: string; points: Pt[]; dash?: boolean };
type Ref = { v: number; label: string; color: string };

export default function Trend({ series, yMin = 0, yMax = 100, refs = [], height = 240, unit = '%' }:
  { series: Series[]; yMin?: number; yMax?: number; refs?: Ref[]; height?: number; unit?: string }) {
  const W = 900, H = height, L = 46, R = 14, T = 12, B = 28;
  const all = series.flatMap((s) => s.points.map((p) => p.t));
  if (all.length < 2) return <div className="empty">Belum ada data untuk ditampilkan.</div>;
  const t0 = Math.min(...all), t1 = Math.max(...all) || t0 + 1;
  const X = (t: number) => L + ((t - t0) / Math.max(1, t1 - t0)) * (W - L - R);
  const Y = (v: number) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B);
  const step = (yMax - yMin) / 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => yMin + i * step);
  const xt = [0, 1, 2, 3, 4].map((i) => t0 + (i * (t1 - t0)) / 4);
  const span = t1 - t0;
  const fmt = (t: number) => {
    const d = new Date(t);
    return span > 36 * 3600e3 ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: span < 3600e3 ? '2-digit' : undefined, hour12: false });
  };
  const path = (pts: Pt[]) => {
    let d = '', pen = false;
    for (const p of pts) {
      if (p.v == null) { pen = false; continue; }
      const v = Math.min(yMax, Math.max(yMin, p.v));
      d += `${pen ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(v).toFixed(1)}`; pen = true;
    }
    return d;
  };
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img">
        {ticks.map((v) => <g key={v}><line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className="grid" /><text x={L - 6} y={Y(v) + 4} className="ax" textAnchor="end">{Math.round(v)}</text></g>)}
        {xt.map((t, i) => <text key={i} x={X(t)} y={H - 8} className="ax" textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{fmt(t)}</text>)}
        {refs.filter((r) => r.v >= yMin && r.v <= yMax).map((r) => <g key={r.label}><line x1={L} x2={W - R} y1={Y(r.v)} y2={Y(r.v)} stroke={r.color} strokeDasharray="4 4" strokeWidth="1" /><text x={W - R - 4} y={Y(r.v) - 4} textAnchor="end" className="ax" fill={r.color}>{r.label}</text></g>)}
        {series.map((s) => <path key={s.name} d={path(s.points)} fill="none" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash ? '6 4' : undefined} />)}
      </svg>
      <div className="legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}<span className="muted">satuan: {unit}</span></div>
    </div>
  );
}
