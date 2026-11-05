// Gambar tangki T-101 dengan level, setpoint, dan batas HH/LL
export default function TankGauge({ level, sp, esd }: { level: number | null; sp: number | null; esd: boolean }) {
  const top = 20, h = 220, x = 40, w = 120;
  const y = (p: number) => top + h - (p / 100) * h;
  const lv = level == null ? 0 : Math.max(0, Math.min(100, level));
  return (
    <svg viewBox="0 0 240 270" className="tank" role="img" aria-label="Level tangki T-101">
      <rect x={x} y={top} width={w} height={h} rx="8" className="tank-shell" />
      {level != null && <rect x={x + 2} y={y(lv)} width={w - 4} height={(lv / 100) * h - 2} rx="4" className={esd ? 'water esd' : 'water'} />}
      {[['HH 90', 90, '#b91c1c'], ['LL 15', 15, '#6d28d9']].map(([l, p, c]) => (
        <g key={l as string}><line x1={x - 6} x2={x + w + 6} y1={y(p as number)} y2={y(p as number)} stroke={c as string} strokeWidth="1.5" /><text x={x + w + 10} y={y(p as number) + 4} fill={c as string} fontSize="11">{l}</text></g>))}
      {sp != null && <g><line x1={x - 6} x2={x + w + 6} y1={y(sp)} y2={y(sp)} stroke="#d97706" strokeWidth="1.5" strokeDasharray="5 4" /><text x={x + w + 10} y={y(sp) + 4} fill="#d97706" fontSize="11">SP {Math.round(sp)}</text></g>}
      <text x={x + w / 2} y={top + h + 22} textAnchor="middle" fontSize="13" fontWeight="700">{level == null ? '---' : lv.toFixed(1) + ' %'}</text>
    </svg>
  );
}
