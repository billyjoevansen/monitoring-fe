import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import type { User } from '@/types';
import type { ClassificationArchive, ReconciliationArchive } from '@/types';

export const metadata = {
  title: 'Dashboard',
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
    } else {
      console.error('Dashboard Error: User not found or inactive');
    }
    redirect('/unauthorized');
  }

  // Fetch latest classification archive
  const { data: latestClassification } = await supabase
    .from('classification_archives')
    .select('id, user_nama, nama_arsip, summary, model_info, reconciliation_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch latest reconciliation archive
  const { data: latestReconciliation } = await supabase
    .from('reconciliation_archives')
    .select('id, user_id, user_nama, nama_arsip, summary, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch total archives count
  const { count: totalClassifications } = await supabase
    .from('classification_archives')
    .select('*', { count: 'exact', head: true });

  const { count: totalReconciliations } = await supabase
    .from('reconciliation_archives')
    .select('*', { count: 'exact', head: true });

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
