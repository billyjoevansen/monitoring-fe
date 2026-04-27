import type { Metadata } from 'next';
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

      <div className="fixed top-4 left-4 z-50">
        <DarkModeToggle />
      </div>
    </div>
  );
}
