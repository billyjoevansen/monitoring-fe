import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import DarkModeToggle from '@/components/navbar/DarkModeToggle';
import LoginForm from '@/components/auth/LoginForm';
import SlidePanel from '@/components/auth/SlidePanel';

export const metadata: Metadata = {
  applicationName: 'Simpubes Serang',
  title: 'Login',
  description: 'Masuk untuk pencocokkan data dan informasi terkait subsidi pupuk di Kota Serang.',
  other: {
    'og:site_name': 'Simpubes Serang',
    keywords: 'simpubes, serang, pupuk bersubsidi, monitoring, petani, kios',
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <LoginForm />
      <SlidePanel />

      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <DarkModeToggle />
        <div className="relative group">
          <Link
            href="/informasi"
            className="relative p-1.5 w-9 h-9 flex items-center justify-center rounded-md overflow-hidden transition-all duration-300 hover:bg-gray-200 dark:hover:bg-neutral-800 border-2 border-foreground"
            aria-label="Informasi Umum"
          >
            <Info className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
          </Link>
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition bg-gray-900 text-white dark:bg-white dark:text-gray-900">
            Informasi Umum
          </span>
        </div>
      </div>
    </div>
  );
}
