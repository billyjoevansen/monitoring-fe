'use client';

import { useUser } from '@/lib/UserContext';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  const user = useUser();
  return <DashboardClient user={user} />;
}
