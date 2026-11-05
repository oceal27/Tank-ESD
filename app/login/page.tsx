'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
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
    <div className="login-wrap">
      <form className="login" onSubmit={submit}>
        <div className="login-head">PEM AKAMIGAS CEPU</div>
        <h1>Sistem Monitoring &amp; Kontrol</h1>
        <p className="muted">Miniatur Tank Level T-101 + ESD</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required autoComplete="current-password" /></label>
        {err && <div className="err">{err}</div>}
        <button className="btn" disabled={busy}>{busy ? 'Memproses...' : 'Masuk'}</button>
        <p className="muted small">Akun dibuat admin di Supabase (Authentication &gt; Users).</p>
      </form>
    </div>
  );
}
