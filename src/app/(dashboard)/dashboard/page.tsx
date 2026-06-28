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

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id);

  const user = users?.[0];

  if (!user || !user.is_active) redirect('/deactivated');

  const [
    classificationResult,
    reconciliationResult,
    classificationCountResult,
    reconciliationCountResult,
  ] = await Promise.allSettled([
    supabase
      .from('classification_archives')
      .select('id, user_nama, nama_arsip, summary, model_info, reconciliation_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('reconciliation_archives')
      .select('id, user_id, user_nama, nama_arsip, summary, detail, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('classification_archives').select('*', { count: 'exact', head: true }),
    supabase.from('reconciliation_archives').select('*', { count: 'exact', head: true }),
  ]);

  const latestClassification =
    classificationResult.status === 'fulfilled' ? classificationResult.value.data : null;
  const latestReconciliation =
    reconciliationResult.status === 'fulfilled' ? reconciliationResult.value.data : null;
  const totalClassifications =
    classificationCountResult.status === 'fulfilled' ? classificationCountResult.value.count ?? 0 : 0;
  const totalReconciliations =
    reconciliationCountResult.status === 'fulfilled' ? reconciliationCountResult.value.count ?? 0 : 0;

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
