'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from 'lucide-react';
import type { ResultTableProps, ClassifyDetailItem, SortConfig } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  TIDAK_NORMAL: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface ExtendedResultTableProps extends ResultTableProps {
  onFilteredDataChange?: (filtered: ClassifyDetailItem[], searchQuery: string) => void;
}

export default function ResultTable({
  columns,
  data,
  onFilteredDataChange,
}: ExtendedResultTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'nama_petani',
    direction: 'asc',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const search = searchTerm.toLowerCase();
    return data.filter(
      (item) =>
        item.nama_petani?.toLowerCase().includes(search) ||
        item.nik?.toLowerCase().includes(search) ||
        item.poktan?.toLowerCase().includes(search) ||
        String(item.status).toLowerCase().includes(search),
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const comparison = String(aVal).localeCompare(String(bVal));
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Reset to page 1 when search or data changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, data]);

  useEffect(() => {
    onFilteredDataChange?.(filteredData, searchTerm);
  }, [searchTerm, data]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = sortedData.slice(start, start + pageSize);

  const getPageNumbers = (): (number | '...')[] => {
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
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc'
          ? 'desc'
          : prev.key === key && prev.direction === 'desc'
            ? null
            : 'asc',
    }));
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-3 h-3 text-muted-foreground/40" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-500" />
    );
  };

  const formatCellValue = (item: ClassifyDetailItem, key: string): React.ReactNode => {
    const value = item[key];
    switch (key) {
      case 'kios_sesuai':
        return value ? (
          <span className="text-green-600 dark:text-green-400">Ya</span>
        ) : (
          <span className="text-red-600 dark:text-red-400">Tidak</span>
        );
      case 'status':
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[String(value)] ?? 'bg-muted text-muted-foreground'
            }`}
          >
            {String(value)}
          </span>
        );
      case 'confidence':
        return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '-';
      case 'total_pupuk_diajukan_kg':
      case 'total_pupuk_ditebus_kg':
      case 'selisih_total_kg':
        return typeof value === 'number' ? value.toLocaleString() : '-';
      default:
        return value != null ? String(value) : '-';
    }
  };

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72 border-2 border-black dark:border-white/20 rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, NIK, poktan, atau status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Tampilkan:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 border border-input rounded-lg text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} baris
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            dari <span className="font-semibold text-foreground">{sortedData.length}</span> data
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">No</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageData.map((item, idx) => {
              const globalIdx = start + idx;
              return (
                <tr
                  key={globalIdx}
                  className="transition-colors hover:bg-gray-200 dark:hover:bg-slate-800"
                >
                  <td className="px-3 py-2 text-muted-foreground tabular-nums">{globalIdx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-foreground">
                      {formatCellValue(item, col.key)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{start + 1}</span>–
            <span className="font-semibold text-foreground">
              {Math.min(start + pageSize, sortedData.length)}
            </span>{' '}
            dari <span className="font-semibold text-foreground">{sortedData.length}</span>
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
                      ? 'bg-indigo-600 text-white shadow-sm'
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
    </div>
  );
}
