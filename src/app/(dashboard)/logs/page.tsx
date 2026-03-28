import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import LogsClient from './LogsClient';

export default async function LogsPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <LogsClient currentUser={user} />;
}
