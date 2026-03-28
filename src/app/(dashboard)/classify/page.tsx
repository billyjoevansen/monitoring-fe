import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import ClassifyClient from './ClassifyClient';

export default async function ClassifyPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  return <ClassifyClient user={user} />;
}
