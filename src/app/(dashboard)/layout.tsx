'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { manageClient } from '@/lib/supabase/client';
import Navbar from '@/components/navbar/Navbar';
import { UserProvider } from '@/lib/UserContext';
import { hasPermission, ROUTE_PERMISSIONS } from '@/lib/rbac';
import { ShieldX } from 'lucide-react';
import type { User } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = manageClient();

    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile || !profile.is_active) {
        router.replace('/login');
        return;
      }

      setUser(profile as User);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ── RBAC Route Guard ──
  const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(
    ([route]) => pathname === route || pathname.startsWith(route + '/'),
  )?.[1];

  const isAllowed = !requiredPermission || hasPermission(user.role, requiredPermission);

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-gray-50/50">
        <Navbar user={user} />
        <main className="pt-14">
          <div className="max-w-400 mx-auto px-4 sm:px-6 py-8">
            {isAllowed ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <ShieldX className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
                <p className="text-gray-500 text-center max-w-md">
                  <span className="font-semibold capitalize">{user.role}</span> tidak memiliki izin
                  untuk mengakses halaman ini.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
