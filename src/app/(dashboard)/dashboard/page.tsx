import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
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

  // Hitung 3 bulan yang lalu
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoISO = threeMonthsAgo.toISOString();

  let activityQuery = supabaseAdmin
    .from('activity_logs')
    .select('id, action, created_at')
    .gte('created_at', threeMonthsAgoISO)
    .order('created_at', { ascending: false });

  if (user.role === 'bpp') {
    activityQuery = activityQuery.eq('user_id', user.id);
  }

  // Bangun query reconciliation + count (langsung, karena punya kolom kecamatan)
  let recLatestBuilder = supabase
    .from('reconciliation_archives')
    .select('id, user_id, user_nama, nama_arsip, summary, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(1);

  let recCountQuery = supabase
    .from('reconciliation_archives')
    .select('*', { count: 'exact', head: true });

  if (user.role === 'bpp' && user.kecamatan) {
    recLatestBuilder = recLatestBuilder.eq('kecamatan', user.kecamatan);
    recCountQuery = recCountQuery.eq('kecamatan', user.kecamatan);
  }
  const recLatestQuery = recLatestBuilder.maybeSingle();

  // Bangun query classification (butuh sub-query reconciliation_id untuk BPP)
  let clsLatestPromise;
  let clsCountPromise;

  if (user.role === 'bpp' && user.kecamatan) {
    const { data: recIds } = await supabase
      .from('reconciliation_archives')
      .select('id')
      .eq('kecamatan', user.kecamatan);

    const ids = (recIds || []).map((r: { id: string }) => r.id);

    if (ids.length > 0) {
      clsLatestPromise = supabase
        .from('classification_archives')
        .select('id, user_nama, nama_arsip, summary, model_info, reconciliation_id, created_at')
        .in('reconciliation_id', ids)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      clsCountPromise = supabase
        .from('classification_archives')
        .select('*', { count: 'exact', head: true })
        .in('reconciliation_id', ids);
    } else {
      clsLatestPromise = Promise.resolve({ data: null });
      clsCountPromise = Promise.resolve({ count: 0 });
    }
  } else {
    clsLatestPromise = supabase
      .from('classification_archives')
      .select('id, user_nama, nama_arsip, summary, model_info, reconciliation_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    clsCountPromise = supabase
      .from('classification_archives')
      .select('*', { count: 'exact', head: true });
  }

  const [
    classificationResult,
    reconciliationResult,
    classificationCountResult,
    reconciliationCountResult,
    activityResult,
    overallClassificationResult,
  ] = await Promise.allSettled([
    clsLatestPromise,
    recLatestQuery,
    clsCountPromise,
    recCountQuery,
    activityQuery,
    (async () => {
      let query = supabaseAdmin.from('classification_archives').select('summary');
      if (user.role === 'bpp' && user.kecamatan) {
        const { data: recIds } = await supabase
          .from('reconciliation_archives')
          .select('id')
          .eq('kecamatan', user.kecamatan);
        const ids = (recIds || []).map((r: { id: string }) => r.id);
        if (ids.length > 0) {
          query = query.in('reconciliation_id', ids);
        } else {
          return { data: [] };
        }
      }
      return query;
    })(),
  ]);

  const latestClassification =
    classificationResult.status === 'fulfilled' ? classificationResult.value.data : null;
  const latestReconciliation =
    reconciliationResult.status === 'fulfilled' ? reconciliationResult.value.data : null;
  const totalClassifications =
    classificationCountResult.status === 'fulfilled' ? classificationCountResult.value.count ?? 0 : 0;
  const totalReconciliations =
    reconciliationCountResult.status === 'fulfilled' ? reconciliationCountResult.value.count ?? 0 : 0;
  const activities =
    activityResult.status === 'fulfilled' ? activityResult.value.data ?? [] : [];

  let overallClassification = null;
  if (overallClassificationResult.status === 'fulfilled') {
    const rows = overallClassificationResult.value.data ?? [];
    let totalNormal = 0;
    let totalTidakNormal = 0;
    for (const row of rows) {
      const s = row.summary as Record<string, unknown> | null;
      if (s) {
        totalNormal += (s.normal as number) ?? 0;
        totalTidakNormal += (s.tidak_normal as number) ?? 0;
      }
    }
    overallClassification = { normal: totalNormal, tidak_normal: totalTidakNormal };
  }

  return (
    <DashboardClient
      user={user as User}
      latestClassification={(latestClassification as ClassificationArchive) || null}
      latestReconciliation={(latestReconciliation as ReconciliationArchive) || null}
      totalClassifications={totalClassifications ?? 0}
      totalReconciliations={totalReconciliations ?? 0}
      overallClassification={overallClassification}
      activities={activities}
    />
  );
}
