import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

export const metadata: Metadata = {
  title: {
    template: '%s | Simpubes Serang',
    default: 'Simpubes Serang - Sistem Monitoring Pupuk Bersubsidi',
  },
  description: 'Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang',
  metadataBase: new URL('https://simpubes-serang.vercel.app'),
  alternates: {
    canonical: 'https://simpubes-serang.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'FhKgRJuzYIYPHhKzU2bk__2cTEcn-ZumeQ-1Ij9_Kvs',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
