-- =========================================================
-- Skema Supabase: miniatur tank level + PID + ESD
-- Jalankan di Supabase > SQL Editor
-- =========================================================

-- 1. Daftar device (satu baris per ESP32 / unit plant)
create table if not exists public.devices (
  id          text primary key,                 -- contoh: 'tank-01'
  plant_unit  text not null,                    -- contoh: 'TANK-FARM' (untuk dashboard plant gabungan)
  name        text not null,
  key_hash    text not null,                    -- sha256 dari device key, key asli hanya ada di ESP32
  created_at  timestamptz not null default now()
);

-- 2. Data proses (dikirim ESP32 tiap 2 detik)
create table if not exists public.telemetry (
  id            bigint generated always as identity primary key,
  device_id     text not null references public.devices(id),
  ts            timestamptz not null default now(),
  level_pct     real,          -- LT-101
  distance_cm   real,          -- jarak mentah ultrasonik
  setpoint_pct  real,          -- LIC-101 SP
  pump_pwm_pct  real,          -- P-101 output
  gas_adc       integer,       -- AT-101
  leak_adc      integer,       -- LSH-102
  leak          boolean,
  esd_active    boolean not null default false,
  esd_cause     text,          -- 'HH' | 'GAS' | 'LEAK' | 'FAULT_LT' | null
  state         text,          -- 'NORMAL' | 'ALARM' | 'ESD' | 'FAULT'
  rssi          integer,
  fw            text
);
create index if not exists telemetry_device_ts on public.telemetry (device_id, ts desc);

-- 3. Kejadian alarm (dikirim ESP32 saat status berubah)
create table if not exists public.alarm_events (
  id         bigint generated always as identity primary key,
  device_id  text not null references public.devices(id),
  ts         timestamptz not null default now(),
  tag        text not null,            -- 'LT-101', 'AT-101', 'LSH-102', 'UZ-101', 'HS-101'
  kind       text not null,            -- 'HH','H','L','LL','GAS_H','GAS_HH','LEAK','FAULT','ESD','RESET','DEV'
  priority   text not null,            -- 'CRITICAL','HIGH','MEDIUM','LOW','INFO'
  state      text not null,            -- 'ACTIVE' | 'CLEARED'
  value      real,
  message    text,
  acked_by   uuid references auth.users(id),
  acked_at   timestamptz
);
create index if not exists alarm_device_ts on public.alarm_events (device_id, ts desc);

-- 4. Konfigurasi yang bisa diubah dari dashboard (dibaca ESP32 tiap 10 detik)
create table if not exists public.device_config (
  device_id     text primary key references public.devices(id),
  setpoint_pct  real not null default 60 check (setpoint_pct between 0 and 100),
  kp            real not null default 4,
  ki            real not null default 0.5,
  kd            real not null default 0,
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id)
);

-- 5. View status terakhir tiap device (dipakai dashboard plant gabungan)
create or replace view public.v_latest with (security_invoker = true) as
select distinct on (device_id) t.*, d.plant_unit, d.name
from public.telemetry t join public.devices d on d.id = t.device_id
order by device_id, ts desc;

-- =========================================================
-- RLS: hanya user login yang boleh membaca.
-- ESP32 TIDAK menulis langsung ke Supabase; ia lewat API Vercel
-- yang memakai service role key (service role melewati RLS).
-- =========================================================
alter table public.devices       enable row level security;
alter table public.telemetry     enable row level security;
alter table public.alarm_events  enable row level security;
alter table public.device_config enable row level security;

create policy "baca devices"   on public.devices       for select to authenticated using (true);
create policy "baca telemetry" on public.telemetry     for select to authenticated using (true);
create policy "baca alarm"     on public.alarm_events  for select to authenticated using (true);
create policy "baca config"    on public.device_config for select to authenticated using (true);
create policy "ubah config"    on public.device_config for update to authenticated using (true)
  with check (setpoint_pct between 0 and 100);

-- Acknowledge alarm lewat fungsi, supaya user hanya bisa mengisi acked_by/acked_at
create or replace function public.ack_alarm(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update public.alarm_events set acked_by = auth.uid(), acked_at = now()
  where id = p_id and acked_at is null;
$$;
revoke all on function public.ack_alarm(bigint) from public, anon;
grant execute on function public.ack_alarm(bigint) to authenticated;

-- Realtime untuk dashboard
alter publication supabase_realtime add table public.telemetry;
alter publication supabase_realtime add table public.alarm_events;

-- Data awal (ganti key_hash dengan hasil: echo -n 'KEY-RAHASIA' | sha256sum)
insert into public.devices (id, plant_unit, name, key_hash)
values ('tank-01', 'TANK-FARM', 'Miniatur Tank T-101', 'diisi di bawah')
on conflict (id) do nothing;
insert into public.device_config (device_id) values ('tank-01') on conflict do nothing;

-- =========================================================
-- Fungsi trend: rata-rata per bucket waktu (dipakai halaman /trend)
-- =========================================================
create or replace function public.trend(p_device text, p_from timestamptz, p_to timestamptz, p_bucket_s int)
returns table (ts timestamptz, level_pct real, setpoint_pct real, pump_pwm_pct real, gas_adc real, esd int)
language sql stable security invoker set search_path = public as $$
  select date_bin(make_interval(secs => p_bucket_s), t.ts, timestamptz '2000-01-01') as ts,
         avg(t.level_pct)::real, avg(t.setpoint_pct)::real, avg(t.pump_pwm_pct)::real, avg(t.gas_adc)::real,
         max(t.esd_active::int)
  from public.telemetry t
  where t.device_id = p_device and t.ts >= p_from and t.ts < p_to
  group by 1 order by 1;
$$;
grant execute on function public.trend(text, timestamptz, timestamptz, int) to authenticated;

-- Isi hash device key (ganti KEY-RAHASIA dengan DEVICE_KEY di main.py)
update public.devices set key_hash = encode(sha256('i7ec8w65dfT93VtngMCWmK0kDAvFS2Uz'::bytea), 'hex') where id = 'tank-01';
