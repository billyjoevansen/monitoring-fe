import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';
import { hasPermission } from '@/config/rbac';
import type { User } from '@/types';

export type ServerStatus = 'loading' | 'online' | 'offline';

export function useDashboard(user: User) {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('loading');

  const canViewDashboard = hasPermission(user.role, 'view_dashboard');
  const canViewApiStatus = hasPermission(user.role, 'view_api');

  useEffect(() => {
    const controller = new AbortController();

    healthCheck(controller.signal)
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));

    return () => controller.abort();
  }, []);

  return {
    serverStatus,
    canViewDashboard,
    canViewApiStatus,
  };
}
