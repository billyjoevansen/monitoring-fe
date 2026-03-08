'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth';
import { ROLE_LABELS, ROLE_COLORS, hasPermission } from '@/lib/rbac';
import type { ActivityLog, Role } from '@/types';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: 'Login', color: 'bg-blue-100 text-blue-700' },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-700' },
  reconcile: { label: 'Rekonsiliasi', color: 'bg-green-100 text-green-700' },
  train_model: { label: 'Training Model', color: 'bg-purple-100 text-purple-700' },
  predict: { label: 'Prediksi', color: 'bg-indigo-100 text-indigo-700' },
  update_config: { label: 'Ubah Konfigurasi', color: 'bg-yellow-100 text-yellow-700' },
  reset_config: { label: 'Reset Konfigurasi', color: 'bg-orange-100 text-orange-700' },
  create_user: { label: 'Buat User', color: 'bg-teal-100 text-teal-700' },
  update_user: { label: 'Edit User', color: 'bg-cyan-100 text-cyan-700' },
  activate_user: { label: 'Aktifkan User', color: 'bg-emerald-100 text-emerald-700' },
  deactivate_user: { label: 'Nonaktifkan User', color: 'bg-red-100 text-red-700' },
  change_password: { label: 'Ganti Password', color: 'bg-amber-100 text-amber-700' },
};

const PAGE_SIZE = 15;

export default function LogsPage() {
  const currentUser = useUser();
  const canManageLogs = hasPermission(currentUser.role, 'view_logs');

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Bulk delete
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [bulkDeletingLogs, setBulkDeletingLogs] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filterAction, filterRole]);

  const loadLogs = async () => {
    setLoading(true);
    const supabase = manageClient();

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filterAction) {
      query = query.eq('action', filterAction);
    }

    if (filterRole) {
      query = query.eq('user_role', filterRole);
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count } = await query;

    if (data) setLogs(data as ActivityLog[]);
    if (count !== null) setTotalCount(count);
    setLoading(false);
  };

  const handleRefresh = () => {
    setPage(1);
    loadLogs();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('');
    setFilterRole('');
    setPage(1);
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.user_nama?.toLowerCase().includes(q) ||
      log.user_email?.toLowerCase().includes(q) ||
      log.detail?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q)
    );
  });

  const toggleSelectLog = (id: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAllLogs = () => {
    const visibleIds = filteredLogs.map((l) => l.id);
    setSelectedLogIds((prev) => {
      if (prev.size === visibleIds.length && visibleIds.length > 0) {
        return new Set();
      }
      return new Set(visibleIds);
    });
  };

  const handleBulkDeleteLogs = async () => {
    if (selectedLogIds.size === 0) return;
    if (
      !confirm(
        `Hapus ${selectedLogIds.size} log? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;

    setBulkDeletingLogs(true);
    const supabase = manageClient();
    const ids = [...selectedLogIds];
    const { error: deleteError } = await supabase.from('activity_logs').delete().in('id', ids);

    if (!deleteError) {
      await logActivity('delete_log', `Menghapus ${ids.length} log aktivitas sekaligus`);
      setSelectedLogIds(new Set());
      await loadLogs();
    }

    setBulkDeletingLogs(false);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const allVisibleSelected =
    filteredLogs.length > 0 && filteredLogs.every((l) => selectedLogIds.has(l.id));

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
            <h1 className="text-3xl font-bold text-gray-800">Log Aktivitas</h1>
            <p className="text-gray-500 mt-1">Pantau seluruh aktivitas pengguna dalam sistem</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filter</span>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              onChange={(e) => {
                setFilterRole(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3">Total: {totalCount} log tercatat</p>
      </div>

      {/* Bulk action bar */}
      {canManageLogs && selectedLogIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm text-blue-700 font-medium flex-1">
            {selectedLogIds.size} item terpilih
          </span>
          <button
            onClick={handleBulkDeleteLogs}
            disabled={bulkDeletingLogs}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {bulkDeletingLogs ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Hapus Terpilih
          </button>
          <button
            onClick={toggleSelectAllLogs}
            className="px-4 py-1.5 text-sm text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            Batal
          </button>
        </div>
      )}

      {/* Loading */}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {canManageLogs && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAllLogs}
                          disabled={filteredLogs.length === 0}
                          className="w-4 h-4 accent-green-600 rounded border-gray-300 cursor-pointer disabled:opacity-40"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Aksi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLogs.map((log, idx) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: 'bg-gray-100 text-gray-700',
                    };

                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        {canManageLogs && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLogIds.has(log.id)}
                              onChange={() => toggleSelectLog(log.id)}
                              className="w-4 h-4 accent-green-600 rounded border-gray-300 cursor-pointer"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 text-gray-500">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <p className="text-gray-800 font-medium">
                                {formatDate(log.created_at)}
                              </p>
                              <p className="text-xs text-gray-500">{formatTime(log.created_at)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <div>
                              <p className="text-gray-800 font-medium">{log.user_nama}</p>
                              <p className="text-xs text-gray-500">{log.user_email}</p>
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
                            <Activity className="w-3.5 h-3.5 text-gray-400" />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}
                            >
                              {actionInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {log.detail || '-'}
                        </td>
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
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                <span className="text-sm text-gray-600">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
