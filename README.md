# tank-esd

Website monitoring miniatur **tank level control + ESD** (T-101).
ESP32 (MicroPython) -> `POST /api/ingest` (Vercel) -> Supabase -> dashboard (Vercel).

Halaman: `/login`, `/dashboard` (live), `/trend` (historis + CSV), `/alarms` (alarm aktif + ACK), `/setpoint` (setpoint + gain PID), `/plant` (plant gabungan).
API: `POST /api/ingest` (untuk ESP32), `GET /api/status` (untuk dashboard plant gabungan).

## 1. Supabase
1. Buat project baru di supabase.com (region Singapore).
2. Ganti `KEY-RAHASIA` di baris terakhir `supabase/schema.sql` dengan key yang sama dengan `DEVICE_KEY` di `main.py`.
3. SQL Editor > New query > tempel isi `supabase/schema.sql` > Run.
4. Authentication > Users > Add user: buat akun login anggota kelompok (centang Auto Confirm User).
5. Project Settings > API: catat Project URL, anon key, dan service_role key.

## 2. Jalankan di laptop (opsional, untuk tim Frontend)
    npm install
    copy .env.example .env.local      (lalu isi nilainya)
    npm run dev                       (buka http://localhost:3000)

## 3. GitHub
    git init
    git add .
    git commit -m "tank-esd awal"
    git branch -M main
    git remote add origin git@github.com:USERNAME/tank-esd.git
    git push -u origin main
Undang anggota kelompok lewat Settings > Collaborators.

## 4. Vercel
1. Add New > Project > Import repo `tank-esd`.
2. Isi Environment Variables SEBELUM klik Deploy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (tandai Sensitive, jangan diberi awalan NEXT_PUBLIC_)
   - `NEXT_PUBLIC_DEVICE_ID` = `tank-01`
3. Deploy. Alamat website misalnya `https://tank-esd.vercel.app`. Kalau variabel diubah belakangan, wajib Redeploy.

## 5. Uji API tanpa ESP32 (PowerShell)
    $h = @{ "x-device-id" = "tank-01"; "x-device-key" = "KEY-RAHASIA" }
    $b = '{"fw":"tes","samples":[{"ms_ago":0,"level_pct":55,"setpoint_pct":60,"pump_pwm_pct":70,"gas_adc":600,"leak_adc":4000,"leak":false,"esd_active":false,"state":"NORMAL"}]}'
    Invoke-RestMethod -Uri https://tank-esd.vercel.app/api/ingest -Method Post -Headers $h -Body $b -ContentType "application/json"
Balasan `ok : True` berarti backend siap. Login ke website, data uji muncul di dashboard.

## 6. ESP32
Di `main.py` isi `API_URL = "https://tank-esd.vercel.app/api/ingest"`, simpan ke ESP32 lewat Thonny, tekan EN/RST.
