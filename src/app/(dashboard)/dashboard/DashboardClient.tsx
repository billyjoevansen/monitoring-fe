'use client';

import { LayoutDashboard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROLE_LABELS } from '@/config/rbac';
import type { DashboardClientProps } from '@/types';
import Hero from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import ServerStatusBadge from '@/components/dashboard/ServerStatusBadge';
import CarouselControls from '@/components/dashboard/CarouselControls';
import ClassificationSlide from '@/components/dashboard/slides/ClassificationSlide';
import ReconciliationSlide from '@/components/dashboard/slides/ReconciliationSlide';
import ArchiveSlide from '@/components/dashboard/slides/ArchiveSlide';

export default function DashboardClient({
  user,
  latestClassification,
  latestReconciliation,
  totalClassifications,
  totalReconciliations,
}: DashboardClientProps) {
  const {
    serverStatus,
    slide,
    paused,
    setPaused,
    canViewDashboard,
    canViewApiStatus,
    goTo,
    prev,
    next,
  } = useDashboard(user);

  return (
    <div className="space-y-8">
      {canViewApiStatus && <ServerStatusBadge status={serverStatus} />}

      <style>{`
        @keyframes dashProgress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>

      <Hero
        icon={<LayoutDashboard className="w-10 h-10 text-white" />}
        title="Dashboard"
        subtitle={`Selamat datang, ${user.nama} — ${ROLE_LABELS[user.role]}${user.kecamatan ? ` · Kec. ${user.kecamatan}` : ''}`}
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
        <div>
          <CarouselControls
            slide={slide}
            paused={paused}
            onGoTo={goTo}
            onPrev={prev}
            onNext={next}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          />
          <div key={slide} className="animate-in fade-in duration-300">
            {slide === 0 && <ClassificationSlide data={latestClassification} />}
            {slide === 1 && <ReconciliationSlide data={latestReconciliation} />}
            {slide === 2 && (
              <ArchiveSlide
                totalClassifications={totalClassifications}
                totalReconciliations={totalReconciliations}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
