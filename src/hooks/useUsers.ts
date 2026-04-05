'use client';

import { useEffect, useState } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { getCreatableRoles } from '@/config/rbac';
import { logActivity } from '@/lib/auth-client';
import { deleteUserCompletely, updateUserPassword } from '@/lib/auth-server';
import type { User, Role, Kecamatan } from '@/types';

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
  const [kecamatanList, setKecamatanList] = useState<Kecamatan[]>([]);
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

    const [usersRes, kecRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('kecamatan').select('*').order('nama'),
    ]);

    if (usersRes.data) {
      let filtered = usersRes.data as User[];
      if (currentUser.role === 'kabid') {
        filtered = filtered.filter(
          (u) => u.role === 'kasie' || u.role === 'bpp' || u.id === currentUser.id,
        );
      }
      setUsers(filtered);
    }

    if (kecRes.data) setKecamatanList(kecRes.data as Kecamatan[]);
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

        if (form.password && form.password.length >= 8) {
          await updateUserPassword(editingUser.id, form.password);
        }

        await logActivity('update_user', `Mengubah user ${form.nama} (${form.role})`);

        showSuccessMessage(`User ${form.nama} berhasil diperbarui.`);
      } else {
        if (!form.password || form.password.length < 8) {
          setError('Password minimal 8 karakter.');
          setSaving(false);
          return;
        }

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { nama: form.nama } },
        });

        if (authErr) throw authErr;
        if (!authData.user) throw new Error('Gagal membuat akun.');

        const { error: insertErr } = await supabase.from('users').insert({
          id: authData.user.id,
          email: form.email,
          nama: form.nama,
          role: form.role,
          kecamatan: form.role === 'bpp' ? form.kecamatan : null,
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
      await deleteUserCompletely(user.id);

      await logActivity('delete_user', `Menghapus user ${user.nama}`);
      await loadData();
      showSuccessMessage(`User ${user.nama} berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      setError('Gagal menghapus user.');
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

    if (!toggleErr) {
      await logActivity(
        newStatus ? 'activate_user' : 'deactivate_user',
        `${newStatus ? 'Mengaktifkan' : 'Menonaktifkan'} user ${user.nama}`,
      );
      await loadData();
      showSuccessMessage(`User ${user.nama} ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
    }

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
      await Promise.all(ids.map((id) => deleteUserCompletely(id)));

      await logActivity('delete_user', `Bulk delete ${ids.length} user`);
      setSelectedIds(new Set());
      await loadData();
      showSuccessMessage(`${ids.length} user berhasil dihapus.`);
    } catch (err) {
      console.error(err);
      setError('Gagal bulk delete user.');
    }

    setBulkDeleting(false);
  };

  return {
    currentUser,
    users,
    kecamatanList,
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
