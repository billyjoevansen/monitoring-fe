import { Pencil, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/config/rbac';
import type { User } from '@/types';

interface UserTableProps {
  users: User[];
  currentUserId: string;
  selectedIds: Set<string>;
  allSelected: boolean;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function UserTable({
  users,
  currentUserId,
  selectedIds,
  allSelected,
  onEdit,
  onToggleActive,
  onDelete,
  onToggleSelect,
  onToggleSelectAll,
}: UserTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-input text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </th>
              {['No', 'Nama', 'Email', 'Role', 'Kecamatan', 'Status', 'Aksi'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada user.
                </td>
              </tr>
            ) : (
              users.map((u, idx) => {
                const isSelectable = u.id !== currentUserId && !u.is_active;
                const isChecked = selectedIds.has(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-gray-200 dark:hover:bg-slate-800 ${
                      isChecked ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      {isSelectable && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(u.id)}
                          className="rounded border-input text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{u.nama}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.kecamatan || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                        }`}
                      >
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.id !== currentUserId && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit(u)}
                            title="Edit"
                            className="p-1.5 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/40"
                          >
                            <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => onToggleActive(u)}
                            title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className="p-1.5 rounded-lg transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                          >
                            {u.is_active ? (
                              <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <ShieldOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </button>
                          {!u.is_active && (
                            <button
                              onClick={() => onDelete(u)}
                              title="Hapus"
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-100 dark:hover:bg-red-900/40"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
