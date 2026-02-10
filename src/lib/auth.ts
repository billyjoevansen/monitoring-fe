import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

/**
 * Login dengan email & password.
 */
export async function login(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Logout.
 */
export async function logout() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Ambil profil user dari tabel public.users.
 */
export async function getUserProfile(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

  if (error || !data) return null;
  return data as User;
}

/**
 * Kirim email reset password.
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/change-password`,
  });

  if (error) throw error;
}

/**
 * Update password baru.
 */
export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Log aktivitas user.
 */
export async function logActivity(action: string, detail?: string) {
  const supabase = createClient();
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
