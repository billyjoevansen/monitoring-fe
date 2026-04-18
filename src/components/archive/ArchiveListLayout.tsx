import { Loader2, Trash2, Eye, ChevronDown, ChevronRight, Search, MapPin } from 'lucide-react';
import type { BaseArchive, BaseSummary, ArchiveListLayoutProps } from '@/types';
import { KECAMATAN_LIST } from '@/config/kecamatan';
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
  filterWilayah,
  expandedId,
  deleting,
  canEdit,
  onSearchChange,
  onSearchSubmit,
  onFilterWilayahChange,
  onToggleExpand,
  onView,
  onDelete,
  formatDate,
  renderExpandedSummary,
  selectedIds,
  allSelected,
  bulkDeleting,
  onToggleSelect,
  onToggleSelectAll,
  onBulkDelete,
  userKecamatan,
}: ArchiveListLayoutProps<T>) {
  const isBpp = !!userKecamatan;
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
      <div className="mb-8 flex items-center gap-3">
        {icon}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari arsip dengan menekan tombol enter..."
            autoComplete="off"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchSubmit?.();
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {isBpp ? (
            <div className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-foreground select-none cursor-not-allowed min-w-45">
              {userKecamatan}
            </div>
          ) : (
            <select
              value={filterWilayah}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => onFilterWilayahChange(e.target.value)}
            >
              <option value="">Semua Wilayah</option>
              {KECAMATAN_LIST.map((kecamatan) => (
                <option key={kecamatan} value={kecamatan}>
                  {kecamatan}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Bulk delete toolbar */}
      {canEdit && selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-4">
          <p className="text-sm font-medium text-red-700">{selectedIds.size} arsip dipilih</p>
          <button
            onClick={onBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {bulkDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Hapus {selectedIds.size} Arsip
          </button>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-background rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 text-foreground mx-auto mb-3">{emptyIcon}</div>
          <p className="text-foreground font-medium">{emptyTitle}</p>
          <p className="text-muted-foreground text-sm mt-1">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Select all bar */}
          {canEdit && (
            <div className="flex items-center gap-3 px-5 py-2.5 bg-background border-b border-gray-100">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs text-foreground font-medium">Pilih semua</span>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {filtered.map((archive) => (
              <div
                key={archive.id}
                className={`group transition-colors duration-200 ${
                  selectedIds.has(archive.id) ? 'bg-red-50 dark:bg-gray-500/50' : ''
                } hover:bg-gray-200 dark:hover:bg-slate-500`}
              >
                {/* Main row */}
                <div className="flex items-center justify-between px-5 py-4">
                  {/* Left */}
                  <div className="flex items-center gap-3 flex-1">
                    {canEdit && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(archive.id)}
                        onChange={() => onToggleSelect(archive.id)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                      />
                    )}

                    <button
                      onClick={() => onToggleExpand(archive.id)}
                      className="p-1 hover:bg-white rounded transition-colors"
                    >
                      {expandedId === archive.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1">
                      {/* Title */}
                      <p className="font-semibold text-foreground leading-snug">
                        {archive.nama_arsip}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Dibuat oleh : </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-500/70">
                          {archive.user_nama}
                        </span>
                        <span>Waktu : </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-500/70">
                          {formatDate(archive.created_at)}
                        </span>
                        <span>Jumlah : </span>
                        <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-medium">
                          {archive.summary.total_petani} petani
                        </span>
                        <span>Wilayah : </span>
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-500/70">
                          {archive.kecamatan}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
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
                        disabled={deleting === archive.id}
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

                {/* Expanded */}
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
