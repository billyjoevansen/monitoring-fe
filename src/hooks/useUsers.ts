'use client';

import { useEffect, useState } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { getCreatableRoles } from '@/config/rbac';
import { logActivity } from '@/lib/auth-client';
import { createUser, deleteUserCompletely, updateUserPassword } from '@/lib/auth-server';
import type { User, Role } from '@/types';

export interface UserFormState {
  email: string;
  nama: string;
  role: Role;
  kecamatan: string;
  password: string;
}

const DEFAULT_FORM: UserFormState = {
  email: '',
  nama: '',
  role: 'bpp',
  kecamatan: '',
  password: '',
};

export function useUsers(currentUser: User) {
  const creatableRoles = getCreatableRoles(currentUser.role);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(DEFAULT_FORM);

  const [toggleDialogUser, setToggleDialogUser] = useState<User | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = manageClient();

    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      let filtered = data as User[];
      if (currentUser.role === 'kabid') {
        filtered = filtered.filter(
          (u) => u.role === 'kasie' || u.role === 'bpp' || u.id === currentUser.id,
        );
      }
      setUsers(filtered);
    }

    setLoading(false);
  };

  const showSuccessMessage = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingUser(null);
    setShowForm(false);
    setError(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      nama: user.nama,
      role: user.role,
      kecamatan: user.kecamatan || '',
      password: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = manageClient();

    try {
      if (editingUser) {
        // ── EDIT USER ──────────────────────────────────────────────────────
        // Hanya update kolom di tabel users — tidak menyentuh sesi auth sama sekali
        const updateData: Partial<User> = {
          nama: form.nama,
          role: form.role,
          kecamatan: form.role === 'bpp' ? form.kecamatan : null,
        };

        const { error: updateErr } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (updateErr) throw updateErr;

        // Update password via server action (admin API) jika diisi
        if (form.password && form.password.length >= 8) {
          await updateUserPassword(editingUser.id, form.password);
        } else if (form.password && form.password.length > 0) {
          throw new Error('Password minimal 8 karakter.');
        }

        await logActivity(
          'update_user',
          `Mengedit user ${form.nama} (${form.role})${form.password ? ' + password baru' : ''}`,
        );

        showSuccessMessage(`User ${form.nama} berhasil diperbarui.`);
      } else {
        // ── BUAT USER BARU ─────────────────────────────────────────────────
        // Validasi password
        if (!form.password || form.password.length < 8) {
          setError('Password minimal 8 karakter.');
          setSaving(false);
          return;
        }

        // PENTING: Gunakan server action (admin API) — bukan supabase.auth.signUp()
        // signUp() di browser client akan menggantikan sesi aktif (auto-login sebagai user baru)
        const newAuthUser = await createUser(form.email, form.password, form.nama);

        // Insert profil ke tabel users
        const { error: insertErr } = await supabase.from('users').insert({
          id: newAuthUser.id,
          email: form.email,
          nama: form.nama,
          role: form.role,
          kecamatan: form.role === 'bpp' ? form.kecamatan : null,
          is_active: true,
        });

        if (insertErr) throw insertErr;

        await logActivity('create_user', `Membuat user ${form.nama} (${form.role})`);
        showSuccessMessage(`User ${form.nama} berhasil dibuat.`);
      }

      resetForm();
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      // Gunakan server action (admin API) — tidak menyentuh sesi browser
      await deleteUserCompletely(user.id);
      await logActivity('delete_user', `Menghapus user ${user.nama} (${user.role})`);
      await loadData();
      showSuccessMessage(`User ${user.nama} berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal menghapus user.');
    }

    setDeleteDialogUser(null);
  };

  const handleToggleActive = async (user: User) => {
    const supabase = manageClient();
    const newStatus = !user.is_active;

    const { error: toggleErr } = await supabase
      .from('users')
      .update({ is_active: newStatus })
      .eq('id', user.id);

    if (toggleErr) {
      setError('Gagal mengubah status user.');
      setToggleDialogUser(null);
      return;
    }

    await logActivity(
      newStatus ? 'activate_user' : 'deactivate_user',
      `${newStatus ? 'Mengaktifkan' : 'Menonaktifkan'} user ${user.nama}`,
    );
    await loadData();
    showSuccessMessage(`User ${user.nama} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);

    setToggleDialogUser(null);
  };

  const selectableUsers = users.filter((u) => u.id !== currentUser.id && !u.is_active);
  const allSelected =
    selectableUsers.length > 0 && selectableUsers.every((u) => selectedIds.has(u.id));

  const toggleSelectUser = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableUsers.map((u) => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setBulkDeleting(true);
    const ids = Array.from(selectedIds);

    try {
      // Semua delete via server action (admin API) — tidak menyentuh sesi browser
      await Promise.all(ids.map((id) => deleteUserCompletely(id)));
      await logActivity('delete_user', `Bulk delete ${ids.length} user`);
      setSelectedIds(new Set());
      await loadData();
      showSuccessMessage(`${ids.length} user berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Gagal bulk delete user.');
    }

    setBulkDeleting(false);
  };

  return {
    currentUser,
    users,
    creatableRoles,
    loading,
    saving,
    success,
    setSuccess,
    error,
    showForm,
    editingUser,
    form,
    setForm,
    toggleDialogUser,
    setToggleDialogUser,
    deleteDialogUser,
    setDeleteDialogUser,
    openAddForm,
    openEditForm,
    resetForm,
    handleSubmit,
    handleDeleteUser,
    handleToggleActive,
    selectedIds,
    allSelected,
    bulkDeleting,
    toggleSelectUser,
    toggleSelectAll,
    handleBulkDelete,
  };
}
