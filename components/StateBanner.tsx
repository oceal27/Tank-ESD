const TEXT: Record<string, string> = {
  NORMAL: 'NORMAL: level dijaga PID',
  WARMUP: 'PEMANASAN MQ-2: trip gas belum aktif',
  ALARM: 'ALARM: ada kondisi tidak normal, cek halaman alarm',
  ESD: 'ESD AKTIF: pompa dimatikan, tekan RESET di panel lokal setelah aman',
  FAULT: 'FAULT SENSOR LEVEL: pompa dimatikan, cek HC-SR04',
  OFFLINE: 'DEVICE OFFLINE: tidak ada data lebih dari 10 detik',
};

export default function StateBanner({ state, cause }: { state: string; cause?: string | null }) {
  const s = TEXT[state] ? state : 'OFFLINE';
  return <div className={`banner b-${s}`}>{TEXT[s]}{cause && (s === 'ESD' || s === 'FAULT') ? `  (penyebab: ${cause})` : ''}</div>;
}
