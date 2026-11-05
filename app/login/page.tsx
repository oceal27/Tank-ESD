'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';
import LoginBg from '@/components/LoginBg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await sb().auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (error) setErr('Login gagal: email atau password salah.');
    else router.replace('/dashboard');
  }
  return (
    <div className="lg-wrap">
      <LoginBg />
      <form className="lg-card" onSubmit={submit}>
        <div className="lg-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </div>
        <div className="lg-org">PEM AKAMIGAS CEPU</div>
        <h1>Sistem Monitoring &amp; Kontrol</h1>
        <p className="lg-sub">Miniatur Tank Level T-101 + ESD</p>
        <label className="lg-field">Email
          <input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </label>
        <label className="lg-field">Password
          <span className="lg-pass">
            <input type={show ? 'text' : 'password'} placeholder="Masukkan password" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" />
            <button type="button" className="lg-eye" onClick={() => setShow(!show)}>{show ? 'Sembunyi' : 'Lihat'}</button>
          </span>
        </label>
        {err && <div className="lg-err">{err}</div>}
        <button className="lg-btn" disabled={busy}>{busy ? 'Memproses...' : 'Masuk'}</button>
        <div className="lg-chips"><span>LT-101</span><span>AT-101</span><span>LSH-102</span><span>UZ-101 ESD</span></div>
        <p className="lg-note">Akun dibuat admin di Supabase (Authentication &gt; Users).</p>
      </form>
      <div className="lg-foot">D4 Teknik Instrumentasi Kilang · Proyek IoT Tank Level &amp; ESD</div>
    </div>
  );
}
