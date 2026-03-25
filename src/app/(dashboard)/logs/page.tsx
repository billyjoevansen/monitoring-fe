'use client';

import {
  Loader2,
  ScrollText,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  User,
  Activity,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/config/rbac';
import { ACTION_LABELS, PAGE_SIZE } from '@/config/logConfig';
import type { Role } from '@/types';
import { useLogs } from '@/hooks/useLogs';
import { Button } from '@/components/ui/button';

export default function LogsPage() {
  const {
    filteredLogs,
    loading,
    totalCount,
    totalPages,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filterAction,
    updateFilterAction,
    filterRole,
    updateFilterRole,
    handleResetFilters,
    selectedLogs,
    toggleSelectAll,
    toggleSelectLog,
    canDelete,
    showDeleteModal,
    deleteMode,
    logToDelete,
    deleting,
    openDeleteModal,
    openBulkDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleRefresh,
  } = useLogs();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Log Aktivitas</h1>
            <p className="text-muted-foreground mt-1">
              Pantau seluruh aktivitas pengguna dalam sistem
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-background rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Filter</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari nama, email, atau detail..."
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filter Aksi */}
          <div>
            <select
              value={filterAction}
              onChange={(e) => updateFilterAction(e.target.value)}
              className="bg-background px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Aksi</option>
              {Object.entries(ACTION_LABELS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Role */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => updateFilterRole(e.target.value)}
              className="bg-background px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Role</option>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {(searchQuery || filterAction || filterRole) && (
            <button
              onClick={handleResetFilters}
              className="bg-red-200 dark:bg-red-500 px-3 py-2 text-sm text-foreground hover:bg-red-50 dark:hover:bg-red-700 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">Total: {totalCount} log tercatat</p>
          {canDelete && selectedLogs.size > 0 && (
            <button
              onClick={openBulkDeleteModal}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Hapus {selectedLogs.size} log terpilih
            </button>
          )}
        </div>
      </div>

      {/* Loading & Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada log aktivitas.</p>
          <p className="text-gray-400 text-sm mt-1">
            Log akan muncul saat pengguna melakukan aksi di sistem.
          </p>
        </div>
      ) : (
        <>
          {/* Log Table */}
          <div className="bg-background rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-gray-200">
                  <tr>
                    {canDelete && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedLogs.size === filteredLogs.length && filteredLogs.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Aktivitas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Detail
                    </th>
                    {canDelete && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log, idx) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: 'bg-gray-100 text-gray-700',
                    };

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        {canDelete && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.has(log.id)}
                              onChange={() => toggleSelectLog(log.id)}
                              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 text-foreground tabular-nums">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-foreground" />
                            <div>
                              <p className="text-muted-foreground font-medium">
                                {formatDate(log.created_at)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(log.created_at)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-foreground" />
                            <div>
                              <p className="text-foreground font-medium">{log.user_nama}</p>
                              <p className="text-xs text-muted-foreground">{log.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {log.user_role && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                ROLE_COLORS[log.user_role as Role] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {ROLE_LABELS[log.user_role as Role] || log.user_role}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-foreground" />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}
                            >
                              {actionInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground truncate max-w-sm">
                          {log.detail || '-'}
                        </td>
                        {canDelete && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openDeleteModal(log)}
                              className="p-1.5 text-red-600 dark:text-red-50 hover:bg-red-100 dark:hover:bg-red-500 rounded-lg transition-colors"
                              title="Hapus log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-sm text-foreground">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-slate-600 text-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {deleteMode === 'single' ? 'Hapus Log' : 'Hapus Multiple Log'}
                </h3>
                <p className="text-sm text-gray-500">
                  {deleteMode === 'single'
                    ? 'Apakah Anda yakin ingin menghapus log ini?'
                    : `Apakah Anda yakin ingin menghapus ${selectedLogs.size} log terpilih?`}
                </p>
              </div>
            </div>

            {deleteMode === 'single' && logToDelete && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">User:</span> {logToDelete.user_nama}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Aksi:</span>{' '}
                  {ACTION_LABELS[logToDelete.action]?.label || logToDelete.action}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Waktu:</span> {formatDate(logToDelete.created_at)}{' '}
                  {formatTime(logToDelete.created_at)}
                </p>
              </div>
            )}

            <p className="text-sm text-red-600 mb-6">Tindakan ini tidak dapat dibatalkan.</p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
