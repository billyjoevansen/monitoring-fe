'use client';

import { useEffect } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = manageClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
    </div>
  );
}
