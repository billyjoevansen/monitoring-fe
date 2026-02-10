'use client';

import { Fragment, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultTableProps {
  columns: { key: string; label: string }[];
  data: Record<string, unknown>[];
  pageSize?: number;
  expandable?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ResultTable({
  columns,
  data,
  pageSize: defaultPageSize = 10,
  expandable = true,
}: ResultTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const filtered = data.filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? '')
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

  const toggleRow = (globalIndex: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(globalIndex)) {
        next.delete(globalIndex);
      } else {
        next.add(globalIndex);
      }
      return next;
    });
  };

  const mainColumnKeys = new Set(columns.map((c) => c.key));

  const getExtraFields = (row: Record<string, unknown>) => {
    return Object.entries(row).filter(([key]) => !mainColumnKeys.has(key) && key !== 'id');
  };

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari data..."
            autoComplete="off"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Tampil:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} baris
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{filtered.length}</span> data
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {expandable && <th className="px-3 py-3 w-10"></th>}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                No
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.map((row, idx) => {
              const globalIndex = start + idx;
              const isExpanded = expandedRows.has(globalIndex);
              const extraFields = getExtraFields(row);
              const hasExtra = expandable && extraFields.length > 0;

              return (
                <Fragment key={`row-group-${globalIndex}`}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${
                      hasExtra ? 'cursor-pointer' : ''
                    } ${isExpanded ? 'bg-blue-50/50' : ''}`}
                    onClick={() => {
                      if (hasExtra) toggleRow(globalIndex);
                    }}
                  >
                    {expandable && (
                      <td className="px-3 py-3 text-center">
                        {hasExtra && (
                          <button className="p-0.5 hover:bg-gray-200 rounded">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-500">{globalIndex + 1}</td>
                    {columns.map((col) => (
                      <td
                        key={`${globalIndex}-${col.key}`}
                        className="px-4 py-3 text-gray-700 whitespace-nowrap"
                      >
                        {renderCell(row[col.key], col.key)}
                      </td>
                    ))}
                  </tr>

                  {isExpanded && hasExtra && (
                    <tr>
                      <td
                        colSpan={columns.length + (expandable ? 2 : 1)}
                        className="px-6 py-4 bg-blue-50/30 border-b border-blue-100"
                      >
                        <div className="text-xs text-gray-600">
                          <p className="font-semibold text-gray-700 mb-2">Detail Lengkap</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {extraFields.map(([key, value]) => (
                              <div
                                key={`detail-${globalIndex}-${key}`}
                                className="bg-white rounded-lg border border-gray-200 p-2.5"
                              >
                                <p className="text-gray-400 text-[10px] uppercase font-medium">
                                  {formatLabel(key)}
                                </p>
                                <p className="text-gray-800 font-medium mt-0.5">
                                  {renderDetailValue(value, key)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (expandable ? 2 : 1)}
                  className="px-4 py-8 text-center text-gray-400"
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            Menampilkan <span className="font-semibold text-gray-700">{start + 1}</span>–
            <span className="font-semibold text-gray-700">
              {Math.min(start + pageSize, filtered.length)}
            </span>{' '}
            dari <span className="font-semibold text-gray-700">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman pertama"
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 py-1 text-xs text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setPage(p)}
                  className={`min-w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Halaman terakhir"
            >
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function renderDetailValue(value: unknown, key: string): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 0).replace(/[{}"]/g, '').replace(/,/g, ', ');
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'number') {
    if (key.includes('rasio') || key.includes('ratio')) return value.toFixed(2);
    if (key.includes('kg') || key.includes('pupuk') || key.includes('luas'))
      return value.toLocaleString('id-ID');
    return String(value);
  }
  return String(value);
}

function renderCell(value: unknown, key: string): React.ReactNode {
  if (value === null || value === undefined) return '-';

  if (typeof value === 'boolean') {
    return value ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
        Ya
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
        Tidak
      </span>
    );
  }

  if (key === 'status' || key === 'status_tebus') {
    const isNormal = value === 'NORMAL' || value === 'TEBUS LENGKAP' || value === 'SESUAI';
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {String(value)}
      </span>
    );
  }

  if (key === 'confidence') {
    const conf = Number(value);
    const pct = (conf * 100).toFixed(1);
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              conf >= 0.8 ? 'bg-green-500' : conf >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${conf * 100}%` }}
          />
        </div>
        <span className="text-xs">{pct}%</span>
      </div>
    );
  }

  return String(value);
}
