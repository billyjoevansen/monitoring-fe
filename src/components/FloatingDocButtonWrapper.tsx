'use client';

import { useEffect, useState } from 'react';
import { manageClient } from '@/lib/supabase/client';
import FloatingDocButton from '@/components/ui/FloatingDocButton';

export default function FloatingDocButtonWrapper() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = manageClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  if (!userId) return null;

  return <FloatingDocButton userId={userId} />;
}
