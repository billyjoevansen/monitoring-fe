import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <UsersClient currentUser={user} />;
}
