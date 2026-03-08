import { Loader2, Trash2, Eye, ChevronDown, ChevronRight, Search } from 'lucide-react';
import type { BaseArchive, BaseSummary, ArchiveListLayoutProps } from '@/types';

export default function ArchiveListLayout<T extends BaseArchive<BaseSummary>>({
  icon,
  title,
  subtitle,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  filtered,
  loading,
  search,
  expandedId,
  deleting,
  canEdit,
  onSearchChange,
  onToggleExpand,
  onView,
  onDelete,
  formatDate,
  renderExpandedSummary,
  selectedIds,
  bulkDeleting,
  onToggleSelect,
  onToggleSelectAll,
  onBulkDelete,
}: ArchiveListLayoutProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari arsip..."
            autoComplete="off"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {canEdit && selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm text-blue-700 font-medium flex-1">
            {selectedIds.size} arsip terpilih
          </span>
          <button
            onClick={onBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {bulkDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Hapus Terpilih
          </button>
          <button
            onClick={onToggleSelectAll}
            className="px-4 py-1.5 text-sm text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            Batal
          </button>
        </div>
      )}

      {/* Select All checkbox */}
      {canEdit && filtered.length > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="select-all-archives"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 accent-green-600 rounded border-gray-300 cursor-pointer"
          />
          <label
            htmlFor="select-all-archives"
            className="text-sm text-gray-600 cursor-pointer select-none"
          >
            Pilih semua
          </label>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 text-gray-300 mx-auto mb-3">{emptyIcon}</div>
          <p className="text-gray-500 font-medium">{emptyTitle}</p>
          <p className="text-gray-400 text-sm mt-1">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((archive) => (
              <div key={archive.id}>
                <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  {/* Left: checkbox + expand + info */}
                  <div className="flex items-center gap-3 flex-1">
                    {canEdit && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(archive.id)}
                        onChange={() => onToggleSelect(archive.id)}
                        className="w-4 h-4 accent-green-600 rounded border-gray-300 cursor-pointer"
                      />
                    )}
                    <button
                      onClick={() => onToggleExpand(archive.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedId === archive.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <div>
                      <p className="font-semibold text-gray-800">{archive.nama_arsip}</p>
                      <p className="text-xs text-gray-500">
                        {archive.user_nama} · {formatDate(archive.created_at)} ·{' '}
                        {archive.summary.total_petani} petani
                      </p>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(archive)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => onDelete(archive)}
                        disabled={deleting === archive.id || selectedIds.size > 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {deleting === archive.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Hapus
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded summary */}
                {expandedId === archive.id && (
                  <div className="px-14 pb-4">{renderExpandedSummary(archive)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
