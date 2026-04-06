import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { hasPermission } from '@/config/rbac';
import { redirect } from 'next/navigation';
import ClassificationArchivesClient from './ClassificationArchivesClient';

export const metadata: Metadata = {
  title: 'Arsip Klasifikasi',
  description: 'Lihat dan kelola arsip klasifikasi data petani.',
};

export default async function ClassificationArchivesPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  const canEdit = hasPermission(user.role, 'manage_archives');

  return <ClassificationArchivesClient canEdit={canEdit} />;
}
