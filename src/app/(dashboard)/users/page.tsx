import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export const metadata: Metadata = {
  title: 'Users',
  description: 'Kelola pengguna dan hak akses dalam sistem.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UsersPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <UsersClient currentUser={user} />;
}
