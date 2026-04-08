import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import type { User } from '@/types';
import type { ClassificationArchive, ReconciliationArchive } from '@/types';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect('/login');

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !user || !user.is_active) {
    if (error) {
      console.error('Dashboard Error:', error.message);
    }
    redirect('/deactivated');
  }

  const [
    { data: latestClassification },
    { data: latestReconciliation },
    { count: totalClassifications },
    { count: totalReconciliations },
  ] = await Promise.all([
    supabase
      .from('classification_archives')
      .select('id, user_nama, nama_arsip, summary, model_info, reconciliation_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('reconciliation_archives')
      .select('id, user_id, user_nama, nama_arsip, summary, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('classification_archives').select('*', { count: 'exact', head: true }),
    supabase.from('reconciliation_archives').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <DashboardClient
      user={user as User}
      latestClassification={(latestClassification as ClassificationArchive) || null}
      latestReconciliation={(latestReconciliation as ReconciliationArchive) || null}
      totalClassifications={totalClassifications ?? 0}
      totalReconciliations={totalReconciliations ?? 0}
    />
  );
}
