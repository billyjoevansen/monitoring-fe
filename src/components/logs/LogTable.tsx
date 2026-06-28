import { Clock, User, Activity, Trash2, ChevronLeft, ChevronRight, ScrollText } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/config/rbac';
import { ACTION_LABELS, PAGE_SIZE } from '@/config/logConfig';
import { formatDate, formatTime } from '@/components/logs/logUtils';
import type { ActivityLog, Role } from '@/types';
import { Button } from '../ui/button';

interface LogTableProps {
  logs: ActivityLog[];
  canDelete: boolean;
  selectedLogs: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelectLog: (id: string) => void;
  onDeleteLog: (log: ActivityLog) => void;
  page: number;
  totalPages: number;
  onPageChange: (updater: (p: number) => number) => void;
}

export function LogTable({
  logs,
  canDelete,
  selectedLogs,
  onToggleSelectAll,
  onToggleSelectLog,
  onDeleteLog,
  page,
  totalPages,
  onPageChange,
}: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-12 text-center">
        <ScrollText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">Belum ada log aktivitas.</p>
        <p className="text-muted-foreground text-sm mt-1">
          Log akan muncul saat pengguna melakukan aktivitas di sistem.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-300">
            <tr>
              {canDelete && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLogs.size === logs.length && logs.length > 0}
                    onChange={onToggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
              )}
              {['No.', 'Waktu', 'Pengguna', 'Role', 'Aktivitas', 'Detail'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                >
                  {col}
                </th>
              ))}
              {canDelete && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log, idx) => {
              const actionInfo = ACTION_LABELS[log.action] ?? {
                label: log.action,
                color: 'bg-gray-100 text-gray-700',
              };
              return (
                <tr
                  key={log.id}
                  className="hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {canDelete && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedLogs.has(log.id)}
                        onChange={() => onToggleSelectLog(log.id)}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                  )}

                  {/* No. */}
                  <td className="px-4 py-3 text-foreground">{(page - 1) * PAGE_SIZE + idx + 1}</td>

                  {/* Waktu */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-foreground" />
                      <div>
                        <p className="text-foreground font-medium">{formatDate(log.created_at)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Pengguna */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-foreground" />
                      <div>
                        <p className="text-foreground font-medium">{log.user_nama}</p>
                        <p className="text-xs text-muted-foreground">{log.user_email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    {log.user_role && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ROLE_COLORS[log.user_role as Role] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ROLE_LABELS[log.user_role as Role] ?? log.user_role}
                      </span>
                    )}
                  </td>

                  {/* Aktivitas */}
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

                  {/* Detail */}
                  <td className="px-4 py-3 text-foreground max-w-xs truncate">
                    {log.detail || '-'}
                  </td>

                  {/* Aksi */}
                  {canDelete && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDeleteLog(log)}
                        className="p-1.5 text-red-600 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg transition-colors"
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
        <div className="flex gap-5 items-center justify-center px-4 py-3 border-t border-gray-200">
          <Button
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="pagination"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-sm text-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="pagination"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
