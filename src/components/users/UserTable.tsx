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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
              </th>
              {['No', 'Nama', 'Email', 'Role', 'Kecamatan', 'Status', 'Aksi'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
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
                    className={`hover:bg-gray-50 transition-colors ${isChecked ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      {isSelectable && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(u.id)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{u.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}
                      >
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.kecamatan || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => onToggleActive(u)}
                            title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            className="p-1.5 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            {u.is_active ? (
                              <ShieldCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <ShieldOff className="w-4 h-4 text-yellow-600" />
                            )}
                          </button>
                          {!u.is_active && (
                            <button
                              onClick={() => onDelete(u)}
                              title="Hapus"
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
