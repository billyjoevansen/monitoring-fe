import { getUser } from '@/lib/getUser';
import { hasPermission } from '@/config/rbac';
import { redirect } from 'next/navigation';
import ReconciliationArchivesClient from './ReconciliationArchivesClient';

export default async function ReconciliationArchivesPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  const canEdit = hasPermission(user.role, 'manage_archives');

  return <ReconciliationArchivesClient canEdit={canEdit} />;
}
