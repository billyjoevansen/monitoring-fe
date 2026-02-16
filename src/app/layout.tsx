import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simpubes - Serang',
  description: 'Sistem Monitoring Pupuk Bersubsidi Kota Serang',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
