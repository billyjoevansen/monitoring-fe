'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Trash2,
  Plus,
} from 'lucide-react';

export interface ColumnGroup {
  label: string;
  columns: { key: string; label: string }[];
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface DocumentDataTableProps {
  groups: ColumnGroup[];
  data: Record<string, string | number>[];
  editable: boolean;
  onRowChange?: (rowIndex: number, key: string, value: string) => void;
  onEditRow?: (rowIndex: number) => void;
  onAddRow?: () => void;
  onDeleteRow?: (rowIndex: number) => void;
  loading?: boolean;
  showRowNumber?: boolean;
}

export default function DocumentDataTable({
  groups,
  data,
  editable,
  onRowChange,
  onEditRow,
  onAddRow,
  onDeleteRow,
  loading,
  showRowNumber = true,
}: DocumentDataTableProps) {
  const allColumns = useMemo(() => groups.flatMap((g) => g.columns), [groups]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      allColumns.some((col) =>
        String(row[col.key] ?? '').toLowerCase().includes(q),
      ),
    );
  }, [data, allColumns, searchQuery]);

  const filteredIndices = useMemo(() => {
    if (!searchQuery.trim()) return data.map((_, i) => i);
    const q = searchQuery.toLowerCase();
    return data.reduce<number[]>((acc, row, i) => {
      if (allColumns.some((col) => String(row[col.key] ?? '').toLowerCase().includes(q))) {
        acc.push(i);
      }
      return acc;
    }, []);
  }, [data, allColumns, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = filteredData.slice(start, start + pageSize);

  const getPageNumbers = useCallback((): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const handleCellChange = useCallback(
    (rowIndex: number, key: string, value: string) => {
      onRowChange?.(rowIndex, key, value);
    },
    [onRowChange],
  );

  const showActions = (!editable && !!onEditRow) || !!onDeleteRow;
  const totalColSpan = allColumns.length + (showRowNumber ? 1 : 0) + (showActions ? 1 : 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-12 text-center">
        <Loader2 className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-3">Memuat isi dokumen...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-12 text-center">
        <p className="text-sm text-muted-foreground">Tidak ada data.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 overflow-hidden">
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 shrink-0">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{start + 1}</span>–
            <span className="font-semibold text-foreground">
              {Math.min(start + pageSize, filteredData.length)}
            </span>{' '}
            dari <span className="font-semibold text-foreground">{filteredData.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman pertama"
            >
              <ChevronsLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 py-1 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setPage(p)}
                  className={`min-w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman terakhir"
            >
              <ChevronsRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari di semua kolom..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          {onAddRow && (
            <button
              type="button"
              onClick={onAddRow}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris
            </button>
          )}
          <label className="text-xs text-muted-foreground">Tampilkan:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} baris
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-auto max-h-[65vh]">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            {/* Row 1: Group headers */}
            <tr className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
              {showRowNumber && (
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 text-center font-bold text-foreground border-r border-b border-gray-200 dark:border-gray-600 sticky left-0 z-20 bg-gray-100 dark:bg-slate-700 min-w-12"
                >
                  No.
                </th>
              )}
              {showActions && (
                <th
                  rowSpan={2}
                  className="px-3 py-2.5 text-center font-bold text-foreground border-r border-b border-gray-200 dark:border-gray-600 whitespace-nowrap bg-gray-100 dark:bg-slate-700 min-w-16"
                >
                  Aksi
                </th>
              )}
              {groups.map((group) => (
                <th
                  key={group.label}
                  colSpan={group.columns.length}
                  className="px-3 py-2.5 text-center font-bold text-foreground border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 whitespace-nowrap bg-gray-100 dark:bg-slate-700"
                >
                  {group.label}
                </th>
              ))}
            </tr>
            {/* Row 2: Column sub-headers */}
            <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
              {groups.map((group) =>
                group.columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-left font-semibold text-foreground border-r border-gray-200 dark:border-gray-700 last:border-r-0 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className="px-4 py-8 text-center text-xs text-muted-foreground"
                >
                  Tidak ada data yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              pageData.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {showRowNumber && (
                    <td className="px-3 py-2 text-center text-muted-foreground border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 sticky left-0 z-10">
                      {start + ri + 1}
                    </td>
                  )}
                  {showActions && (
                    <td className="px-3 py-2 text-center border-r border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-center gap-1">
                        {onEditRow && (
                          <button
                            type="button"
                            onClick={() => onEditRow?.(filteredIndices[start + ri])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                            title="Edit baris ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        {onDeleteRow && (
                          <button
                            type="button"
                            onClick={() => onDeleteRow?.(filteredIndices[start + ri])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  {allColumns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-foreground border-r border-gray-100 dark:border-gray-800 last:border-r-0 whitespace-nowrap"
                    >
                      {editable && onRowChange ? (
                        <input
                          type="text"
                          value={row[col.key] ?? ''}
                          onChange={(e) => handleCellChange(filteredIndices[start + ri], col.key, e.target.value)}
                          className="w-full bg-transparent text-foreground outline-none focus:bg-blue-50 dark:focus:bg-blue-950/30 focus:ring-1 focus:ring-blue-400 rounded transition-colors"
                        />
                      ) : (
                        <span>{row[col.key] ?? ''}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
