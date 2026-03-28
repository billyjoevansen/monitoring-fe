import { Search, Filter, Trash2 } from 'lucide-react';
import { ROLE_LABELS } from '@/config/rbac';
import { ACTION_LABELS } from '@/config/logConfig';

interface LogsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterAction: string;
  onFilterActionChange: (value: string) => void;
  filterRole: string;
  onFilterRoleChange: (value: string) => void;
  onResetFilters: () => void;
  totalCount: number;
  canDelete: boolean;
  selectedCount: number;
  onBulkDelete: () => void;
}

export function LogsFilter({
  searchQuery,
  onSearchChange,
  filterAction,
  onFilterActionChange,
  filterRole,
  onFilterRoleChange,
  onResetFilters,
  totalCount,
  canDelete,
  selectedCount,
  onBulkDelete,
}: LogsFilterProps) {
  const hasActiveFilter = searchQuery || filterAction || filterRole;

  return (
    <div className="bg-background rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-foreground" />
        <span className="text-sm font-semibold text-foreground">Filter</span>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
            <input
              type="text"
              placeholder="Cari nama, email, atau detail..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Filter Aksi */}
        <select
          value={filterAction}
          onChange={(e) => onFilterActionChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_LABELS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </select>

        {/* Filter Role */}
        <select
          value={filterRole}
          onChange={(e) => onFilterRoleChange(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Semua Role</option>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {hasActiveFilter && (
          <button
            onClick={onResetFilters}
            className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">Total: {totalCount} log tercatat</p>
        {canDelete && selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Hapus {selectedCount} log terpilih
          </button>
        )}
      </div>
    </div>
  );
}
