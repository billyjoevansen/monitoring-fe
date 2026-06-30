import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

export const metadata: Metadata = {
  applicationName: 'Simpubes Serang',
  title: {
    template: '%s | Simpubes Serang',
    default: 'Simpubes Serang - Sistem Monitoring Pupuk Bersubsidi',
  },
  description:
    'Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang, Masuk untuk pencocokkan data dan informasi terkait subsidi pupuk di Kota Serang.',
  metadataBase: new URL('https://simpubes-serang.vercel.app'),
  alternates: {
    canonical: 'https://simpubes-serang.vercel.app',
  },
  openGraph: {
    title: 'Simpubes Serang',
    description:
      'Sistem Informasi Monitoring Pupuk Bersubsidi Kota Serang, Masuk untuk pencocokkan data dan informasi terkait subsidi pupuk di Kota Serang.',
    url: 'https://simpubes-serang.vercel.app',
    siteName: 'Simpubes Serang',
    locale: 'id_ID',
    type: 'website',
  },
  other: {
    'og:site_name': 'Simpubes Serang',
    keywords: 'simpubes, serang, pupuk bersubsidi, monitoring, petani, kios',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'FhKgRJuzYIYPHhKzU2bk__2cTEcn-ZumeQ-1Ij9_Kvs',
    yandex: '5b385bb7f3781ae9',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Simpubes Serang',
    url: 'https://simpubes-serang.vercel.app',
  };
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NavigationProgress />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
