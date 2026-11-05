// Latar halaman login: gambar garis proses T-101 (gaya P&ID) dengan animasi ringan.
export default function LoginBg() {
  return (
    <svg className="lg-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="lg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#e3e8ee" strokeWidth="1" />
        </pattern>
        <clipPath id="lg-tank"><rect x="430" y="300" width="230" height="400" rx="16" /></clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#lg-grid)" />

      {/* TK-100 reservoir */}
      <rect x="92" y="676" width="276" height="132" fill="#dce8f3" />
      <polyline points="90,600 90,810 370,810 370,600" className="lg-eq" />
      <text x="230" y="845" className="lg-tag">TK-100</text>
      {/* P-101 */}
      <circle cx="170" cy="770" r="26" className="lg-eq" fill="#f6f8fa" />
      <polygon points="158,757 158,783 186,770" fill="#94a3b8" />
      <text x="198" y="738" className="lg-tag">P-101</text>

      {/* W-101 & W-102 */}
      <path d="M170,744 V230 H520 V300" className="lg-pipe" />
      <path d="M170,744 V230 H520 V300" className="lg-flow" />
      <text x="300" y="218" className="lg-lbl">W-101</text>
      <path d="M430,660 H300 V600" className="lg-pipe" />
      <path d="M430,660 H300 V600" className="lg-flow slow" />
      <text x="320" y="650" className="lg-lbl">W-102</text>

      {/* T-101 dengan level bergerak */}
      <g clipPath="url(#lg-tank)">
        <rect x="430" y="300" width="230" height="400" fill="#f6f8fa" />
        <rect className="lg-water" x="430" y="460" width="230" height="260" fill="#cfe0f0" />
      </g>
      <rect x="430" y="300" width="230" height="400" rx="16" className="lg-eq" fill="none" />
      <line x1="418" x2="430" y1="340" y2="340" className="lg-tick" /><text x="410" y="344" textAnchor="end" className="lg-lbl">HH</text>
      <line x1="418" x2="430" y1="640" y2="640" className="lg-tick" /><text x="410" y="644" textAnchor="end" className="lg-lbl">LL</text>
      <text x="545" y="520" textAnchor="middle" className="lg-tag big">T-101</text>
      <polyline points="410,712 410,736 680,736 680,712" className="lg-eq thin" />
      <text x="545" y="760" textAnchor="middle" className="lg-lbl">B-101</text>

      {/* LT-101 dan sinyal */}
      <line x1="610" y1="300" x2="610" y2="262" className="lg-sig" />
      <circle cx="610" cy="236" r="26" className="lg-bub" />
      <line x1="584" y1="236" x2="636" y2="236" className="lg-bubline" />
      <text x="610" y="230" textAnchor="middle" className="lg-bubt">LT</text>
      <text x="610" y="252" textAnchor="middle" className="lg-bubt sm">101</text>
      <path d="M610,210 V130 H1180 V250" className="lg-sig" />
      <text x="890" y="118" textAnchor="middle" className="lg-lbl teal">jarak ultrasonik ke ESP32</text>

      {/* AT-101 & LSH-102 */}
      <circle cx="780" cy="420" r="22" className="lg-bub" /><line x1="758" y1="420" x2="802" y2="420" className="lg-bubline" />
      <text x="780" y="415" textAnchor="middle" className="lg-bubt sm">AT</text><text x="780" y="434" textAnchor="middle" className="lg-bubt sm">101</text>
      <line x1="660" y1="420" x2="758" y2="420" className="lg-sig" />
      <circle cx="760" cy="724" r="22" className="lg-bub" /><line x1="738" y1="724" x2="782" y2="724" className="lg-bubline" />
      <text x="760" y="719" textAnchor="middle" className="lg-bubt sm">LSH</text><text x="760" y="738" textAnchor="middle" className="lg-bubt sm">102</text>
      <line x1="680" y1="724" x2="738" y2="724" className="lg-sig" />

      {/* ESP32 / LIC-101 / UZ-101 */}
      <rect x="1100" y="250" width="200" height="250" rx="10" className="lg-eq" fill="#f6f8fa" />
      <text x="1200" y="330" textAnchor="middle" className="lg-big">ESP32</text>
      <text x="1200" y="362" textAnchor="middle" className="lg-lbl">LIC-101  PID</text>
      <text x="1200" y="384" textAnchor="middle" className="lg-lbl">UZ-101  ESD</text>
      <circle className="lg-led" cx="1160" cy="440" r="7" fill="#22c55e" />
      <circle cx="1190" cy="440" r="7" fill="#e5e7eb" /><circle cx="1220" cy="440" r="7" fill="#e5e7eb" />
      <path d="M1100,470 H880 V770 H196" className="lg-sig" />
      <text x="960" y="760" className="lg-lbl teal">PWM ke SC-101 / P-101</text>
      <path d="M802,420 H1040 V400 H1100" className="lg-sig" />
      <path d="M782,724 H1060 V480 H1100" className="lg-sig" />

      {/* gateway & cloud */}
      <path d="M1300,375 H1390" className="lg-pipe thin" />
      <path d="M1300,375 H1390" className="lg-flow data" />
      <text x="1345" y="362" textAnchor="middle" className="lg-lbl teal">USB</text>
      <rect x="1390" y="320" width="150" height="110" rx="8" className="lg-eq" fill="#f6f8fa" />
      <text x="1465" y="370" textAnchor="middle" className="lg-tag">Laptop</text>
      <text x="1465" y="392" textAnchor="middle" className="lg-lbl">gateway</text>
      <path d="M1465,320 V200" className="lg-pipe thin" />
      <path d="M1465,320 V200" className="lg-flow data" />
      <text x="1478" y="268" className="lg-lbl teal">HTTPS</text>
      <path d="M1420,200 a28,28 0 0 1 20,-46 a36,36 0 0 1 66,-8 a26,26 0 0 1 20,54 z" className="lg-eq" fill="#f6f8fa" />
      <text x="1470" y="188" textAnchor="middle" className="lg-lbl">cloud HMI</text>
    </svg>
  );
}
