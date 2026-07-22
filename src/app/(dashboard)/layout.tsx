import { redirect } from 'next/navigation';
import { getUser } from '@/lib/getUser';
import Navbar from '@/components/navbar/Navbar';
import RbacGuard from '@/components/RbacGuard';
import FloatingDocButtonWrapper from '@/components/FloatingDocButtonWrapper';
import { ReconcileProvider } from '@/contexts/ReconcileContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;

  try {
    user = await getUser();
  } catch {
    redirect('/login');
  }

  if (!user.is_active) redirect('/deactivated');

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="pt-14">
        <div className="max-w-400 mx-auto px-4 sm:px-6 py-8">
          <ReconcileProvider>
            <RbacGuard user={user}>{children}</RbacGuard>
          </ReconcileProvider>
        </div>
      </main>
      <FloatingDocButtonWrapper userId={user.id} userEmail={user.email} userName={user.nama} userRole={user.role} />
    </div>
  );
}
