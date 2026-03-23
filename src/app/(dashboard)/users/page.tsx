'use client';

import { CheckCircle, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UserForm } from '@/components/users/UserForm';
import { UserTable } from '@/components/users/UserTable';
import { UserDialogs } from '@/components/users/UserDialogs';

export default function UsersPage() {
  const {
    currentUser,
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
  } = useUsers();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola User</h1>
          <p className="text-gray-500 mt-1">Tambah dan kelola akun pengguna</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Tambah User
        </button>
      </div>

      {/* Notifikasi Sukses */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Bulk delete toolbar */}
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

      {/* Form Tambah / Edit */}
      {showForm && (
        <UserForm
          isEditing={!!editingUser}
          form={form}
          onFormChange={(updated) => setForm((prev) => ({ ...prev, ...updated }))}
          creatableRoles={creatableRoles}
          kecamatanList={kecamatanList}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}

      {/* Tabel User */}
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

      {/* Dialog Konfirmasi */}
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
