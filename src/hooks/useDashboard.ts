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
    let mounted = true;

    healthCheck()
      .then(() => mounted && setServerStatus('online'))
      .catch(() => mounted && setServerStatus('offline'));

    return () => {
      mounted = false;
    };
  }, []);

  return {
    serverStatus,
    canViewDashboard,
    canViewApiStatus,
  };
}
