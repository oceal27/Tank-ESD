'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { sb } from '@/lib/supabase';

const NAV = [['/dashboard', 'Dashboard'], ['/trend', 'Trend'], ['/alarms', 'Alarm'], ['/setpoint', 'Setpoint'], ['/plant', 'Plant']];

// Pembungkus semua halaman: cek login, menu atas, tombol keluar
export default function Shell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    sb().auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else { setEmail(data.session.user.email || ''); setReady(true); }
    });
  }, [router]);
  if (!ready) return <div className="center muted">Memeriksa login...</div>;
  return (
    <div className="app">
      <header className="top">
        <div className="brand">T-101 <span>Tank Level &amp; ESD</span></div>
        <nav>{NAV.map(([h, l]) => <Link key={h} href={h} className={path === h ? 'on' : ''}>{l}</Link>)}</nav>
        <div className="user">{email}
          <button className="link" onClick={async () => { await sb().auth.signOut(); router.replace('/login'); }}>Keluar</button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
