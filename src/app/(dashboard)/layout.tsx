import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/navbar/Navbar';
import { UserProvider } from '@/lib/UserContext';
import RbacGuard from '@/components/RbacGuard';
import type { User } from '@/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect('/login');

  const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  if (!profile || !profile.is_active) redirect('/login');

  const user = profile as User;

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <main className="pt-14">
          <div className="max-w-400 mx-auto px-4 sm:px-6 py-8">
            <RbacGuard user={user}>{children}</RbacGuard>
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
