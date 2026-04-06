import { manageClient } from '@/lib/supabase/client';
import type { User } from '@/types';

// Login
export async function login(email: string, password: string) {
  const supabase = manageClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  await logActivity('login', `User mencoba login`);
  if (error) throw error;
  return data;
}

// Logout.
export async function logout() {
  await logActivity('logout', 'User telah logout');
  const supabase = manageClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// profil user fetch.
export async function getUserProfile(): Promise<User | null> {
  const supabase = manageClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  if (error || !data) return null;
  return data as User;
}

// Log aktivitas user.
export async function logActivity(action: string, detail?: string) {
  const supabase = manageClient();
  const user = await getUserProfile();
  if (!user) return;

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    user_email: user.email,
    user_nama: user.nama,
    user_role: user.role,
    action,
    detail: detail || null,
  });
}
