import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import Navbar from '@/components/navbar/Navbar';
import RbacGuard from '@/components/RbacGuard';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;

  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  if (!user.is_active) redirect('/login');

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="pt-14">
        <div className="max-w-400 mx-auto px-4 sm:px-6 py-8">
          <RbacGuard user={user}>{children}</RbacGuard>
        </div>
      </main>
    </div>
  );
}
