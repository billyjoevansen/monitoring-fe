import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import ClassifyClient from './ClassifyClient';

export const metadata: Metadata = {
  title: 'Klasifikasi',
  description: 'klasifikasikan data petani sebagai transaksi normal atau tidak normal.',
};

export default async function ClassifyPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <ClassifyClient user={user} />;
}
