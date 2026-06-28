import { Metadata } from 'next';
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';
import ReconcileClient from './ReconcileClient';

export const metadata: Metadata = {
  title: 'Rekonsiliasi',
  description: 'rekonsiliasikan data petani untuk memastikan keakuratan informasi.',
};

interface ReconcilePageProps {
  searchParams: Promise<{ doc_id?: string; type?: string }>;
}

export default async function ReconcilePage({ searchParams }: ReconcilePageProps) {
  let user;
  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  if (!user) redirect('/login');

  const params = await searchParams;
  const docId = params.doc_id ?? null;
  const docType = params.type ?? null;

  return <ReconcileClient user={user} initialDocId={docId} initialDocType={docType} />;
}
