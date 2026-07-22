'use client';

import FloatingDocButton from '@/components/ui/FloatingDocButton';

interface FloatingDocButtonWrapperProps {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
}

export default function FloatingDocButtonWrapper({ userId, userEmail, userName, userRole }: FloatingDocButtonWrapperProps) {
  return <FloatingDocButton userId={userId} userEmail={userEmail} userName={userName} userRole={userRole} />;
}
