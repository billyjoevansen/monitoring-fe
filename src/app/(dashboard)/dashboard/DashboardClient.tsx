'use client';

import { LayoutDashboard, ArrowRight, Archive, BrainCircuit, FileStack } from 'lucide-react';
import Link from 'next/link';
import { ROLE_LABELS } from '@/config/rbac';
import type { DashboardClientProps } from '@/types';
import Hero from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import ServerStatusBadge from '@/components/dashboard/ServerStatusBadge';
import ActivityChart from '@/components/dashboard/ActivityChart';
import GlobalStats from '@/components/dashboard/GlobalStats';
import ClassificationSlide from '@/components/dashboard/slides/ClassificationSlide';
import ReconciliationSlide from '@/components/dashboard/slides/ReconciliationSlide';

export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
  totalClassifications,
  totalReconciliations,
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
          {/* Global Stats */}
          <GlobalStats />

          {/* Classification + Reconciliation Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ClassificationSlide data={latestClassification} />
            <ReconciliationSlide data={latestReconciliation} />
          </div>

          {/* Activity Monitoring Chart */}
          <ActivityChart activities={activities} userRole={user.role} />

          {/* Archive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/archives/reconciliation"
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-5 hover:shadow-md hover:border-amber-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileStack className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{totalReconciliations}</p>
                  <p className="text-xs text-muted-foreground">Arsip Rekonsiliasi</p>
                </div>
              </div>
            </Link>

            <Link
              href="/archives/classification"
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 shadow-sm p-5 hover:shadow-md hover:border-purple-300 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-foreground">{totalClassifications}</p>
                  <p className="text-xs text-muted-foreground">Arsip Klasifikasi</p>
                </div>
              </div>
            </Link>

            <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
                  <Archive className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-green-700 dark:text-green-400">
                    {totalClassifications + totalReconciliations}
                  </p>
                  <p className="text-xs text-green-600">Total Semua Arsip</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
