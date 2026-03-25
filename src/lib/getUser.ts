import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types';

export const getUser = cache(async (): Promise<User> => {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) throw new Error('Unauthenticated');

  const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  if (!profile) throw new Error('User not found');

  return profile as User;
});
