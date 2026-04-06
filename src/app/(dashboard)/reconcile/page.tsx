import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import ReconcileClient from './ReconcileClient';

export const metadata: Metadata = {
  title: 'Rekonsiliasi',
  description: 'rekonsiliasikan data petani untuk memastikan keakuratan informasi.',
};
export default async function ReconcilePage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  if (!user) redirect('/login');

  return <ReconcileClient user={user} />;
}
