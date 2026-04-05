'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function deleteUserCompletely(userId: string) {
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(`Auth delete failed: ${authError.message}`);
  }

  const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', userId);

  if (dbError) {
    throw new Error(`DB delete failed: ${dbError.message}`);
  }

  return { success: true };
}

export async function updateUserPassword(userId: string, newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password minimal 8 karakter.');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(`Update password gagal: ${error.message}`);
  }

  return { success: true };
}
