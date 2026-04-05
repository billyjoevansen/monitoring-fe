import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { hasPermission } from '@/config/rbac';
import type { User } from '@/types';

export const SLIDE_DURATION = 7000;
export const SLIDE_COUNT = 3;

export type ServerStatus = 'loading' | 'online' | 'offline';
export type SlideIndex = 0 | 1 | 2;

export function useDashboard(user: User) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('loading');
  const [slide, setSlide] = useState<SlideIndex>(0);
  const [paused, setPaused] = useState(false);

  const canViewDashboard = hasPermission(user.role, 'view_dashboard');
  const canViewApiStatus = hasPermission(user.role, 'view_api');

  useEffect(() => {
    healthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setSlide((s) => ((s + 1) % SLIDE_COUNT) as SlideIndex),
      SLIDE_DURATION,
    );
    return () => clearInterval(id);
  }, [paused, slide]);

  const goTo = (i: number) => setSlide(i as SlideIndex);
  const prev = () => setSlide((s) => ((s - 1 + SLIDE_COUNT) % SLIDE_COUNT) as SlideIndex);
  const next = () => setSlide((s) => ((s + 1) % SLIDE_COUNT) as SlideIndex);

  return {
    serverStatus,
    slide,
    paused,
    setPaused,
    canViewDashboard,
    canViewApiStatus,
    goTo,
    prev,
    next,
  };
}
