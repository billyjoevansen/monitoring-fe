'use client';

import { CheckCircle, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserForm } from '@/components/users/UserForm';
import { UserTable } from '@/components/users/UserTable';
import { UserDialogs } from '@/components/users/UserDialogs';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import Hero from '@/components/ui/Hero';

export default function UsersClient({ currentUser }: { currentUser: User }) {
  const {
    users,
    kecamatanList,
    creatableRoles,
    loading,
    saving,
    success,
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
  } = useUsers(currentUser);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <Hero
        icon={<UserPlus className="w-10 h-10 text-foreground" />}
        title="Manajemen User"
        subtitle="Kelola akun pengguna, atur peran, dan aktifkan atau nonaktifkan akses dengan mudah."
        actions={
          <Button onClick={openAddForm} variant="outline">
            <UserPlus className="w-4 h-4" />
            Tambah User
          </Button>
        }
      />

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4">
          <p className="text-sm font-medium text-red-700">{selectedIds.size} user dipilih</p>
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {bulkDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Hapus {selectedIds.size} User
          </button>
        </div>
      )}

      <UserTable
        users={users}
        currentUserId={currentUser.id}
        selectedIds={selectedIds}
        allSelected={allSelected}
        onEdit={openEditForm}
        onToggleActive={setToggleDialogUser}
        onDelete={setDeleteDialogUser}
        onToggleSelect={toggleSelectUser}
        onToggleSelectAll={toggleSelectAll}
      />

      <UserForm
        open={showForm}
        isEditing={!!editingUser}
        form={form}
        onFormChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
        creatableRoles={creatableRoles}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />

      <UserDialogs
        toggleDialogUser={toggleDialogUser}
        deleteDialogUser={deleteDialogUser}
        onConfirmToggle={handleToggleActive}
        onConfirmDelete={handleDeleteUser}
        onCancelToggle={() => setToggleDialogUser(null)}
        onCancelDelete={() => setDeleteDialogUser(null)}
      />
    </div>
  );
}
