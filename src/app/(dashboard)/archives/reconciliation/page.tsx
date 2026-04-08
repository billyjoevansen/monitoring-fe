import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { hasPermission } from '@/config/rbac';
import { redirect } from 'next/navigation';
import ReconciliationArchivesClient from './ReconciliationArchivesClient';

export const metadata: Metadata = {
  title: 'Arsip Rekonsiliasi',
  description: 'Lihat dan kelola arsip rekonsiliasi data petani.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReconciliationArchivesPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  const canEdit = hasPermission(user.role, 'manage_archives');

  return (
    <ReconciliationArchivesClient
      canEdit={canEdit}
      userRole={user.role}
      userKecamatan={user.kecamatan ?? null}
    />
  );
}
