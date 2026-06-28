import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { hasPermission } from '@/config/rbac';
import { redirect } from 'next/navigation';
import RdkkArchivesClient from './RdkkArchivesClient';

export const metadata: Metadata = {
  title: 'Dokumen RDKK',
  description: 'Lihat dan kelola dokumen pengajuan RDKK.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RdkkArchivesPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  const canAccess = hasPermission(user.role, 'view_documents');

  return (
    <RdkkArchivesClient
      userId={user.id}
      canAccess={canAccess}
      userRole={user.role}
      userKecamatan={user.kecamatan}
    />
  );
}
