'use client';

import { LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROLE_LABELS } from '@/config/rbac';
import type { DashboardClientProps } from '@/types';
import Hero from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import ServerStatusBadge from '@/components/dashboard/ServerStatusBadge';
import ActivityChart from '@/components/dashboard/ActivityChart';
import GlobalStats from '@/components/dashboard/GlobalStats';
import KecamatanChart from '@/components/dashboard/KecamatanChart';
import FertilizerChart from '@/components/dashboard/FertilizerChart';
import MTDistributionChart from '@/components/dashboard/MTDistributionChart';
import ClassificationSlide from '@/components/dashboard/slides/ClassificationSlide';
import ReconciliationSlide from '@/components/dashboard/slides/ReconciliationSlide';

export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
  activities,
}: DashboardClientProps) {
  const { serverStatus, canViewDashboard, canViewApiStatus } = useDashboard(user);

  return (
    <div className="space-y-8">
      {canViewApiStatus && <ServerStatusBadge status={serverStatus} />}

      <Hero
        icon={<LayoutDashboard className="w-10 h-10 text-white" />}
        title="Dashboard"
        subtitle={`Selamat datang, ${user.nama} — ${ROLE_LABELS[user.role]}${
          user.kecamatan ? ` · Kec. ${user.kecamatan}` : ''
        }`}
        className="bg-background"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/reconcile">
              Cocokan Data
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Link>
          </Button>
        }
      />

      {canViewDashboard && (
        <>
          {/* Ringkasan Global */}
          <GlobalStats />

          {/* Distribusi Pupuk Global + Musim Tanam */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FertilizerChart />
            <MTDistributionChart />
          </div>

          {/* Statistik Per Kecamatan */}
          <KecamatanChart user={user} />

          {/* Arsip Terakhir */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
            <ClassificationSlide data={latestClassification} />
            <ReconciliationSlide data={latestReconciliation} />
          </div>

          {/* Monitor Aktivitas */}
          <ActivityChart activities={activities} userRole={user.role} />
        </>
      )}
    </div>
  );
}
