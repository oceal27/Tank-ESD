'use client';
import { useEffect, useState } from 'react';
import { sb, DEVICE, Row, AlarmEvent } from './supabase';

// Ambil N baris terakhir telemetry lalu dengarkan baris baru secara realtime
export function useTelemetry(limit = 300) {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let alive = true;
    sb().from('telemetry').select('*').eq('device_id', DEVICE).order('ts', { ascending: false }).limit(limit)
      .then(({ data }) => { if (alive && data) setRows((data as Row[]).reverse()); });
    const ch = sb().channel(`tel-${DEVICE}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry', filter: `device_id=eq.${DEVICE}` },
        (p) => setRows((r) => {
          const n = [...r, p.new as Row];
          n.sort((a, b) => (a.ts < b.ts ? -1 : 1));   // data yang tertahan saat WiFi putus bisa datang belakangan
          return n.slice(-limit);
        }))
      .subscribe();
    return () => { alive = false; sb().removeChannel(ch); };
  }, [limit]);
  return rows;
}

export function useAlarms(limit = 200) {
  const [rows, setRows] = useState<AlarmEvent[]>([]);
  const reload = () => sb().from('alarm_events').select('*').eq('device_id', DEVICE).order('ts', { ascending: false }).limit(limit)
    .then(({ data }) => { if (data) setRows(data as AlarmEvent[]); });
  useEffect(() => {
    reload();
    const ch = sb().channel(`al-${DEVICE}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alarm_events', filter: `device_id=eq.${DEVICE}` }, () => reload())
      .subscribe();
    return () => { sb().removeChannel(ch); };
  }, [limit]);
  return { rows, reload };
}

export function useNow(ms = 1000) {
  const [n, setN] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setN(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return n;
}

// Alarm yang masih aktif = kejadian terakhir per (tag, kind) berstatus ACTIVE
export function activeAlarms(rows: AlarmEvent[]) {
  const seen = new Set<string>(); const out: AlarmEvent[] = [];
  for (const r of rows) {                      // rows urut terbaru dulu
    const k = r.tag + '|' + r.kind;
    if (seen.has(k)) continue; seen.add(k);
    if (r.state === 'ACTIVE' && r.priority !== 'INFO') out.push(r);
  }
  const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return out.sort((a, b) => (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9));
}

export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour12: false });
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('id-ID', { hour12: false });
