import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: {
    template: '%s | Simpubes Serang',
    default: 'Simpubes Serang',
  },
  description: 'Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang',
  /*
  openGraph: {
    title: 'Simpubes - Serang',
    description: 'Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang',
    url: 'https://simpubes-serang.vercel.app',
    siteName: 'Simpubes Serang',
    images: [
      {
        url: 'https://simpubes-serang.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Simpubes Serang',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  */
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
