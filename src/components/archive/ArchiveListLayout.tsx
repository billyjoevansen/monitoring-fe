import { Loader2, Trash2, Eye, ChevronDown, Search, MapPin, Calendar, User } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex items-start sm:items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari arsip (tekan Enter)..."
            autoComplete="off"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit?.();
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          {isBpp ? (
            <div className="w-full sm:w-auto pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-muted/50 text-foreground select-none cursor-not-allowed min-w-0 sm:min-w-45">
              {userKecamatan}
            </div>
          ) : (
            <select
              value={filterWilayah}
              className="w-full sm:w-auto pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 sm:px-5 py-3 mb-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{selectedIds.size} arsip dipilih</p>
          <button
            onClick={onBulkDelete}
            disabled={bulkDeleting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
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
        <div className="bg-gradient-to-br from-muted/30 to-muted/60 dark:from-slate-800 dark:to-slate-900 rounded-xl border border-border p-8 sm:p-12 text-center">
          <div className="w-14 h-14 text-muted-foreground/50 mx-auto mb-3">{emptyIcon}</div>
          <p className="text-foreground font-medium">{emptyTitle}</p>
          <p className="text-muted-foreground text-sm mt-1">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Select all bar */}
          {canEdit && (
            <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 bg-muted/30 border-b border-border">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-medium">Pilih semua</span>
            </div>
          )}

          <div className="divide-y divide-border/50">
            {filtered.map((archive) => (
              <div
                key={archive.id}
                className={`group transition-all duration-200 ${
                  selectedIds.has(archive.id) ? 'bg-red-50 dark:bg-red-950/20' : ''
                } hover:bg-muted/40 dark:hover:bg-slate-800/60`}
              >
                {/* Main row */}
                <div className="px-4 sm:px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      {canEdit && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(archive.id)}
                          onChange={() => onToggleSelect(archive.id)}
                          className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      )}

                      <button
                        onClick={() => onToggleExpand(archive.id)}
                        className="mt-0.5 p-1 hover:bg-muted rounded-md transition-colors shrink-0"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                            expandedId === archive.id ? 'rotate-0' : '-rotate-90'
                          }`}
                        />
                      </button>

                      <div className="flex flex-col gap-2 min-w-0">
                        <p className="font-semibold text-foreground leading-snug wrap-break-words">
                          {archive.nama_arsip}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50">
                            <User className="w-3 h-3" />
                            {archive.user_nama}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50">
                            <Calendar className="w-3 h-3" />
                            {formatDate(archive.created_at)}
                          </span>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-medium">
                            {archive.summary.total_petani} petani
                          </span>

                          {archive.kecamatan && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50">
                              <MapPin className="w-3 h-3" />
                              {archive.kecamatan}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right - desktop */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onView(archive)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat
                      </button>

                      {canEdit && (
                        <button
                          onClick={() => onDelete(archive)}
                          disabled={deleting === archive.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors text-sm font-medium disabled:opacity-50"
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

                  {/* Right - mobile (full-width buttons) */}
                  <div className="mt-3 sm:hidden grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onView(archive)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors text-xs font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat
                    </button>

                    {canEdit ? (
                      <button
                        onClick={() => onDelete(archive)}
                        disabled={deleting === archive.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors text-xs font-medium disabled:opacity-50"
                      >
                        {deleting === archive.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Hapus
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>

                {/* Expanded */}
                {expandedId === archive.id && (
                  <div className="px-4 sm:px-14 pb-4 animate-in slide-in-from-top-1 duration-200">
                    {renderExpandedSummary(archive)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
