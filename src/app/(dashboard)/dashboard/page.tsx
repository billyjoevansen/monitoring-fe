import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardClient from './DashboardClient';
import type { User } from '@/types';
import type { ClassificationArchive, ReconciliationArchive } from '@/types/archive';

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

  if (error || !user || !user.is_active) redirect('/login');

  const [{ data: latestClassification }, { data: latestReconciliation }] = await Promise.all([
    supabase
      .from('classification_archives')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('reconciliation_archives')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <DashboardClient
      user={user as User}
      latestClassification={(latestClassification as ClassificationArchive) ?? null}
      latestReconciliation={(latestReconciliation as ReconciliationArchive) ?? null}
    />
  );
}
