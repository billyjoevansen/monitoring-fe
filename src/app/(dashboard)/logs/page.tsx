import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import LogsClient from './LogsClient';

export const metadata: Metadata = {
  title: 'Log',
  description: 'Lihat log aktivitas pengguna dalam sistem.',
};

export default async function LogsPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <LogsClient currentUser={user} />;
}
