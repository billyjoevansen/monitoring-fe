import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { hasPermission } from '@/config/rbac';
import { redirect } from 'next/navigation';
import SivervalArchivesClient from './SivervalArchivesClient';

export const metadata: Metadata = {
  title: 'Dokumen Si-Verval',
  description: 'Lihat dan kelola dokumen komoditas Si-Verval.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SivervalArchivesPage() {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  const canAccess = hasPermission(user.role, 'view_documents');

  return (
    <SivervalArchivesClient
      userId={user.id}
      canAccess={canAccess}
      userRole={user.role}
      userKecamatan={user.kecamatan}
      userEmail={user.email}
      userName={user.nama}
    />
  );
}
