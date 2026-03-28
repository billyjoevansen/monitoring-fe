import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import ReconcileClient from './ReconcileClient';

export default async function ReconcilePage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <ReconcileClient user={user} />;
}
