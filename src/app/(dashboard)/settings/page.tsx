import { Metadata } from 'next';
import SettingsClient from './settings-client';

export const metadata: Metadata = {
  title: 'Pengaturan',
  description: 'Kelola pengaturan akun dan preferensi sistem.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  return <SettingsClient />;
}
