'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { hasPermission, ROUTE_PERMISSIONS } from '@/config/rbac';
import type { User } from '@/types';

export default function RbacGuard({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(
    ([route]) => pathname === route || pathname.startsWith(route + '/'),
  )?.[1];

  const isAllowed = !requiredPermission || hasPermission(user.role, requiredPermission);

  if (isAllowed) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ShieldX className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Akses Ditolak</h1>
      <p className="text-foreground text-center max-w-md">
        <span className="font-semibold capitalize">{user.role}</span> tidak memiliki izin untuk
        mengakses halaman ini.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Kembali ke Dashboard
      </button>
    </div>
  );
}
