import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SimpubesSRG - Monitoring Pupuk Subsidi',
  description: 'Sistem Monitoring Pupuk Bersubsidi Kab. Serang',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
