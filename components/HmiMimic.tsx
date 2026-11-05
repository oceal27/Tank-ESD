// Mimic proses gaya SCADA/HMI (mengikuti prinsip ISA-101 high performance HMI):
// peralatan abu-abu netral, warna hanya untuk kondisi tidak normal.
// Topologi sama dengan P&ID IOT-PID-001: TK-100 -> P-101 -> W-101 -> T-101 -> W-102 (gravitasi) -> TK-100.
import type { Row, AlarmEvent } from '@/lib/supabase';

type Props = { d?: Row; offline: boolean; alarms: AlarmEvent[]; now: number };

const PRIO: Record<string, { n: string; c: string }> = {
  CRITICAL: { n: '1', c: '#d0021b' }, HIGH: { n: '2', c: '#f07800' }, MEDIUM: { n: '3', c: '#e8c000' }, LOW: { n: '4', c: '#7aa6d6' },
};

export default function HmiMimic({ d, offline, alarms, now }: Props) {
  const ok = !!d && !offline;
  const lvl = ok && d!.level_pct != null ? Math.max(0, Math.min(100, d!.level_pct)) : null;
  const sp = d?.setpoint_pct ?? null;
  const pwm = ok ? d!.pump_pwm_pct ?? 0 : 0;
  const run = ok && pwm > 0;
  const esd = ok && !!d!.esd_active;
  const wet = ok && !!d!.leak;
  const drain = ok && lvl != null && lvl > 3;
  const warn = ok && !esd && (d!.state === 'ALARM' || d!.state === 'WARMUP');
  const blink = Math.floor(now / 500) % 2 === 0;
  const age = d ? Math.max(0, Math.round((now - Date.parse(d.ts)) / 1000)) : null;

  // alarm aktif per tag (untuk penanda prioritas di samping nilai)
  const top = (tag: string) => alarms.find((a) => a.tag === tag);
  const Mark = ({ x, y, tag }: { x: number; y: number; tag: string }) => {
    const a = top(tag); if (!a) return null; const p = PRIO[a.priority] ?? PRIO.LOW;
    return (<g className="amark"><rect x={x} y={y} width="18" height="18" rx="2" fill={p.c} stroke="#222" strokeWidth="1" />
      <text x={x + 9} y={y + 13.5} textAnchor="middle" fontSize="12" fontWeight="800" fill={a.priority === 'MEDIUM' ? '#222' : '#fff'}>{p.n}</text></g>);
  };
  const val = (x: number | null | undefined, n = 1) => (!ok || x == null ? '---' : x.toFixed(n));

  // geometri T-101
  const TX = 600, TY = 110, TW = 170, TH = 280, TB = TY + TH;
  const ly = (p: number) => TB - (p / 100) * TH;

  return (
    <svg viewBox="0 0 1180 610" className="mimic" role="img" aria-label="Mimic proses T-101">
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#4b5563" /></marker>
        <pattern id="stale" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e5e7eb" /><line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="4" /></pattern>
      </defs>

      {/* ---------- jalur proses ---------- */}
      <path d="M200,481 V96 H640 V110" className={run ? 'pipe flow' : 'pipe'} markerEnd="url(#arw)" />
      <text x="420" y="86" className="lbl">W-101  discharge P-101</text>
      <path d="M600,372 H340 V402" className={drain ? 'pipe flow slow' : 'pipe'} markerEnd="url(#arw)" />
      <text x="352" y="364" className="lbl">W-102  gravitasi</text>

      {/* ---------- TK-100 reservoir ---------- */}
      <rect x="112" y="430" width="276" height="108" className="water-res" />
      <polyline points="110,380 110,540 390,540 390,380" className="vessel" />
      <text x="250" y="560" textAnchor="middle" className="tag">TK-100</text>
      <text x="250" y="576" textAnchor="middle" className="lbl">Reservoir 5 L (level tidak diukur)</text>

      {/* ---------- P-101 pompa submersible ---------- */}
      <g>
        <circle cx="200" cy="505" r="24" className={run ? 'pump run' : 'pump'} />
        <polygon points="188,492 188,518 216,505" className={run ? 'pump-tri run' : 'pump-tri'} />
        <text x="236" y="500" className="tag">P-101</text>
        <text x="236" y="517" className={run ? 'stat run' : 'stat'}>{!ok ? '---' : run ? `RUN ${pwm.toFixed(0)}%` : 'STOP'}</text>
      </g>

      {/* ---------- SC-101 driver ---------- */}
      <rect x="420" y="430" width="128" height="58" className={esd ? 'box trip' : 'box'} />
      <text x="484" y="452" textAnchor="middle" className="tag">SC-101</text>
      <text x="484" y="468" textAnchor="middle" className="lbl">Driver L298N</text>
      <text x="484" y="482" textAnchor="middle" className="lbl">{esd ? 'DIBLOK ESD' : `PWM ${val(pwm, 0)}%`}</text>
      <path d="M420,465 H250 L216,486" className="sig" />

      {/* ---------- T-101 ---------- */}
      <rect x={TX} y={TY} width={TW} height={TH} rx="14" className="vessel-fill" />
      {lvl != null && <rect x={TX + 3} y={ly(lvl)} width={TW - 6} height={TB - ly(lvl) - 3} rx="10" className="water" />}
      {!ok && <rect x={TX + 3} y={TY + 3} width={TW - 6} height={TH - 6} rx="10" fill="url(#stale)" opacity=".7" />}
      <rect x={TX} y={TY} width={TW} height={TH} rx="14" className="vessel" fill="none" />
      {[['HH', 90], ['H', 80], ['L', 25], ['LL', 15]].map(([l, p]) => (
        <g key={l as string}>
          <line x1={TX - 10} x2={TX} y1={ly(p as number)} y2={ly(p as number)} className="tick" />
          <text x={TX - 14} y={ly(p as number) + 4} textAnchor="end" className="lbl">{l} {p}</text>
        </g>))}
      {sp != null && <polygon points={`${TX + TW},${ly(sp)} ${TX + TW + 12},${ly(sp) - 7} ${TX + TW + 12},${ly(sp) + 7}`} className="spm" />}
      <text x={TX + TW / 2} y={TY + TH / 2 - 6} textAnchor="middle" className="tag big">T-101</text>
      <text x={TX + TW / 2} y={TY + TH / 2 + 22} textAnchor="middle" className="pv-big">{lvl == null ? '---' : lvl.toFixed(1)}<tspan className="unit"> %</tspan></text>

      {/* ---------- B-101 baki + LSH-102 ---------- */}
      {wet && <rect x="588" y="414" width="194" height="9" fill="#d0021b" opacity={blink ? 0.75 : 0.4} />}
      <polyline points="585,398 585,425 785,425 785,398" className="vessel thin" />
      <text x="685" y="444" textAnchor="middle" className="lbl">B-101  baki penampung</text>
      <line x1="785" y1="414" x2="798" y2="414" className="sig" />
      <Bubble x={820} y={414} a="LSH" b="102" />
      <rect x="846" y="398" width="94" height="32" className={wet ? 'pvbox bad' : 'pvbox'} />
      <text x="893" y="419" textAnchor="middle" className="pv">{!ok ? '---' : wet ? 'BASAH' : 'KERING'}</text>
      <Mark x={846} y={376} tag="LSH-102" />

      {/* ---------- LT-101 ---------- */}
      <line x1="735" y1="110" x2="735" y2="82" className="sig" />
      <Bubble x={735} y={60} a="LT" b="101" />
      <rect x="762" y="40" width="112" height="40" className="pvbox" />
      <text x="818" y="60" textAnchor="middle" className="pv">{val(lvl)} %</text>
      <text x="818" y="75" textAnchor="middle" className="lbl">{val(d?.distance_cm)} cm</text>
      <Mark x={878} y={42} tag="LT-101" />

      {/* ---------- LIC-101 ---------- */}
      <path d="M735,38 V22 H955 V178" className="sig" />
      <Bubble x={955} y={200} a="LIC" b="101" shared />
      <rect x="983" y="172" width="150" height="58" className="pvbox" />
      <text x="991" y="190" className="lbl">PV</text><text x="1125" y="190" textAnchor="end" className="pv sm">{val(lvl)} %</text>
      <text x="991" y="206" className="lbl">SP</text><text x="1125" y="206" textAnchor="end" className="pv sm">{sp == null ? '---' : sp.toFixed(0)} %</text>
      <text x="991" y="222" className="lbl">OUT</text><text x="1125" y="222" textAnchor="end" className="pv sm">{val(pwm, 0)} %</text>
      <text x="1058" y="248" textAnchor="middle" className={esd ? 'stat bad' : 'stat'}>{!ok ? '---' : esd ? 'MODE: ESD (OUT 0%)' : 'MODE: AUTO'}</text>
      <path d="M955,222 V575 H484 V488" className="sig" />
      <Mark x={1137} y={174} tag="LIC-101" />

      {/* ---------- AT-101 ---------- */}
      <Bubble x={500} y={200} a="AT" b="101" />
      <line x1="522" y1="200" x2="600" y2="200" className="sig" />
      <rect x="378" y="180" width="96" height="40" className={top('AT-101') ? 'pvbox bad' : 'pvbox'} />
      <text x="426" y="199" textAnchor="middle" className="pv">{ok && d!.gas_adc != null ? d!.gas_adc : '---'}</text>
      <text x="426" y="214" textAnchor="middle" className="lbl">ADC  gas MQ-2</text>
      <Mark x={356} y={182} tag="AT-101" />

      {/* ---------- UZ-101 ESD ---------- */}
      <rect x="980" y="300" width="160" height="78" className={esd ? 'box trip' : 'box'} />
      <text x="1060" y="322" textAnchor="middle" className="tag">UZ-101  ESD</text>
      <text x="1060" y="344" textAnchor="middle" className={esd ? 'stat bad' : 'stat'}>{!ok ? '---' : esd ? 'TRIP' : 'SEHAT'}</text>
      <text x="1060" y="364" textAnchor="middle" className="lbl">{esd && d!.esd_cause ? `penyebab: ${d!.esd_cause}` : 'HH / gas / bocor / fault'}</text>
      <path d="M990,378 V590 H470 V488" className={esd ? 'sig trip' : 'sig'} />
      <text x="800" y="604" textAnchor="middle" className="lbl">{esd ? 'interlock aktif: SC-101 dipaksa 0%' : 'interlock UZ-101 ke SC-101'}</text>
      <Mark x={1144} y={302} tag="UZ-101" />

      {/* ---------- panel lokal: lampu, buzzer, reset ---------- */}
      <text x="1100" y="420" textAnchor="middle" className="tag">Panel lokal</text>
      {[['XL-101A', '#d0021b', esd && blink], ['XL-101B', '#e8c000', warn], ['XL-101C', '#18a33a', ok && !esd && !warn]].map(([t, c, on], i) => (
        <g key={t as string}>
          <circle cx={1040} cy={445 + i * 26} r="10" fill={on ? (c as string) : '#d1d5db'} stroke="#4b5563" strokeWidth="1.2" />
          <text x={1056} y={449 + i * 26} className="lbl">{t as string}</text>
        </g>))}
      <path d="M1036,528 h10 l14,-10 v32 l-14,-10 h-10 z" fill={esd && blink ? '#d0021b' : '#d1d5db'} stroke="#4b5563" strokeWidth="1.2" />
      <text x="1048" y="566" textAnchor="middle" className="lbl">XA-101</text>
      <circle cx="1130" cy="534" r="11" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.2" />
      <text x="1130" y="560" textAnchor="middle" className="lbl">HS-101</text>
      <text x="1130" y="573" textAnchor="middle" className="lbl">reset fisik</text>

      {/* ---------- komunikasi ---------- */}
      <rect x="110" y="20" width="180" height="44" className={ok ? 'box' : 'box stale'} />
      <text x="200" y="38" textAnchor="middle" className="tag">ESP32 ke cloud</text>
      <text x="200" y="55" textAnchor="middle" className={ok ? 'stat run' : 'stat bad'}>{ok ? `ONLINE  ${age}s` : d ? `OFFLINE  ${age}s` : 'OFFLINE'}</text>
    </svg>
  );
}

function Bubble({ x, y, a, b, shared }: { x: number; y: number; a: string; b: string; shared?: boolean }) {
  return (
    <g className="bubble">
      {shared && <rect x={x - 22} y={y - 22} width="44" height="44" fill="#fff" stroke="#374151" strokeWidth="1.3" />}
      <circle cx={x} cy={y} r="22" fill="#fff" stroke="#374151" strokeWidth="1.5" />
      <line x1={x - 22} y1={y} x2={x + 22} y2={y} stroke="#374151" strokeWidth="1.2" />
      <text x={x} y={y - 6} textAnchor="middle" className="bub">{a}</text>
      <text x={x} y={y + 15} textAnchor="middle" className="bub">{b}</text>
    </g>
  );
}
