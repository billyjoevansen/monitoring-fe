import type { Metadata } from 'next';
import DarkModeToggle from '@/components/navbar/DarkModeToggle';
import LoginForm from '@/components/auth/LoginForm';
import SlidePanel from '@/components/auth/SlidePanel';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Masuk untuk pencocokkan data dan informasi terkait subsidi pupuk di Kota Serang.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <LoginForm />
      <SlidePanel />

      <div className="fixed bottom-4 left-4 z-50">
        <DarkModeToggle />
      </div>
    </div>
  );
}
