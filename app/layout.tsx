import './globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'T-101 Tank Level & ESD', description: 'Monitoring miniatur tank level control dan ESD berbasis IoT' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="id"><body>{children}</body></html>;
}
