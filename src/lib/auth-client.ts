import { manageClient } from '@/lib/supabase/client';
import type { Role, User } from '@/types';

// Login
export async function login(email: string, password: string) {
  const supabase = manageClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  try {
    // Ambil data asli dari tabel public.users dulu
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, nama, role')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      await logActivityWithUser(
        {
          id: profile.id,
          email: profile.email,
          nama: profile.nama,
          role: profile.role as Role,
        },
        'login',
        'User berhasil melakukan login',
      );
    }
  } catch (logError) {
    // Gunakan nama variabel berbeda agar tidak bentrok dengan error login
    console.error('Gagal catat log:', logError);
  }

  return data;
}

// Logout.
export async function logout() {
  try {
    await logActivity('logout', 'User telah melakukan logout');
  } catch {
    // nothing to do
  }
  const supabase = manageClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// profil user fetch.
export async function getUserProfile(): Promise<User | null> {
  try {
    const supabase = manageClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();

    if (error || !data) return null;
    return data as User;
  } catch {
    return null;
  }
}

// Log aktivitas user.
export async function logActivity(action: string, detail?: string) {
  try {
    const supabase = manageClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      console.warn('[logActivity] Tidak ada sesi aktif, log diabaikan:', action);
      return;
    }

    // Ambil profil dari tabel users agar nama & role tersedia
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, nama, role')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      console.warn('[logActivity] Profil user tidak ditemukan, log diabaikan:', action);
      return;
    }

    const { error } = await supabase.from('activity_logs').insert({
      user_id: profile.id,
      user_email: profile.email,
      user_nama: profile.nama,
      user_role: profile.role,
      action,
      detail: detail ?? null,
    });

    if (error) {
      console.error('[logActivity] Gagal menyimpan log:', error.message);
    }
  } catch (err) {
    // Log gagal tidak boleh crash aplikasi
    console.error('[logActivity] Error tidak terduga:', err);
  }
}

async function logActivityWithUser(
  user: Pick<User, 'id' | 'email' | 'nama' | 'role'>,
  action: string,
  detail?: string,
) {
  const supabase = manageClient();
  const { error } = await supabase.from('activity_logs').insert({
    user_id: user.id,
    user_email: user.email,
    user_nama: user.nama,
    user_role: user.role,
    action,
    detail: detail ?? null,
  });

  if (error) {
    console.error('[logActivity] Gagal menyimpan log:', error.message);
  }
}
