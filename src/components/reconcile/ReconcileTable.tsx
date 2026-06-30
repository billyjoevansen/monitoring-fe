'use client';

import { Fragment, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import type { PetaniRow } from '@/types';

const PUPUK_TYPES = [
  { key: 'urea', label: 'Urea' },
  { key: 'npk', label: 'NPK' },
  { key: 'za', label: 'ZA' },
  { key: 'npk_formula', label: 'NPK Formula' },
  { key: 'organik', label: 'Organik' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const STATUS_SORT_MAP: Record<string, string> = {
  tebus_lengkap: 'TEBUS LENGKAP',
  tebus_sebagian: 'TEBUS SEBAGIAN',
  tebus_melebihi: 'TEBUS MELEBIHI',
  belum_menebus: 'BELUM MENEBUS',
};

interface ReconcileTableProps {
  data: Record<string, unknown>[];
  onFilteredDataChange?: (filtered: Record<string, unknown>[], searchQuery: string) => void;
  sortKey?: string | null;
}

const STRIPE_EVEN = 'bg-white dark:bg-slate-900';
const STRIPE_ODD = 'bg-gray-100 dark:bg-slate-800';
const STICKY_BORDER = 'border-r border-border dark:border-white';

export default function ReconcileTable({ data, onFilteredDataChange, sortKey }: ReconcileTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const rows = data as unknown as PetaniRow[];

  const filtered = rows.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.nama_petani?.toLowerCase().includes(q) ||
      row.nik?.toLowerCase().includes(q) ||
      row.poktan?.toLowerCase().includes(q) ||
      row.gapoktan?.toLowerCase().includes(q) ||
      row.status_tebus?.toLowerCase().includes(q)
    );
  });

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const target = STATUS_SORT_MAP[sortKey];
        const aMatch = a.status_tebus === target ? 0 : 1;
        const bMatch = b.status_tebus === target ? 0 : 1;
        return aMatch - bMatch;
      })
    : filtered;

  useEffect(() => {
    onFilteredDataChange?.(sorted as unknown as Record<string, unknown>[], search);
  }, [sorted, search, onFilteredDataChange]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = sorted.slice(start, start + pageSize);

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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-border shadow-sm flex flex-col min-w-0">
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 shrink-0">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-semibold text-foreground">{start + 1}</span>–
            <span className="font-semibold text-foreground">
              {Math.min(start + pageSize, sorted.length)}
            </span>{' '}
            dari <span className="font-semibold text-foreground">{sorted.length}</span>
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

      {/* Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="relative w-full sm:w-72 border-2 border-black dark:border-white/20 rounded-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, NIK, poktan, status..."
            autoComplete="off"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="px-2 py-1.5 border border-input rounded-lg text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} baris
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">
            dari <span className="font-semibold text-foreground">{sorted.length}</span> data
          </p>
        </div>
      </div>

      {/* Table */}
      <div ref={tableWrapperRef} className="overflow-x-auto">
        <table className="w-max min-w-full text-xs border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr>
              <th
                rowSpan={2}
                className={`px-3 py-2 text-left font-semibold text-muted-foreground border-b border-border sticky left-0 z-20 min-w-10 bg-gray-100 dark:bg-slate-800 ${STICKY_BORDER}`}
              >
                No.
              </th>
              <th
                rowSpan={2}
                className={`px-3 py-2 text-left font-semibold text-muted-foreground border-b border-border sticky left-10 z-20 min-w-35 bg-gray-100 dark:bg-slate-800 ${STICKY_BORDER}`}
              >
                Nama Petani
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r border-border min-w-30 bg-gray-100 dark:bg-slate-800"
              >
                NIK
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r border-border min-w-25 bg-gray-100 dark:bg-slate-800"
              >
                Poktan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r border-border min-w-25 bg-gray-100 dark:bg-slate-800"
              >
                Gapoktan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r border-border min-w-25 bg-gray-100 dark:bg-slate-800"
              >
                Kios RDKK
              </th>
              {PUPUK_TYPES.map((p) => (
                <th
                  key={`group-${p.key}`}
                  colSpan={3}
                  className="px-2 py-2 text-center font-semibold text-muted-foreground border-b border-r border-border bg-blue-50 dark:bg-blue-900/20"
                >
                  {p.label}
                </th>
              ))}
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-muted-foreground border-b border-r border-border min-w-20 bg-green-50 dark:bg-green-900/20"
              >
                Total Pengajuan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-muted-foreground border-b border-r border-border min-w-20 bg-green-50 dark:bg-green-900/20"
              >
                Total Tebus
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-muted-foreground border-b border-r border-border min-w-17.5 bg-green-50 dark:bg-green-900/20"
              >
                Selisih
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-center font-semibold text-muted-foreground border-b border-r border-border min-w-27.5 bg-gray-100 dark:bg-slate-800"
              >
                Status
              </th>
            </tr>
            <tr>
              {PUPUK_TYPES.map((p) => (
                <Fragment key={`sub-${p.key}`}>
                  <th className="px-2 py-1.5 text-right font-medium text-muted-foreground border-b border-r border-border bg-blue-50/60 dark:bg-blue-900/10 min-w-15">
                    Ajukan
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium text-muted-foreground border-b border-r border-border bg-blue-50/60 dark:bg-blue-900/10 min-w-15">
                    Tebus
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium text-muted-foreground border-b border-r border-border bg-blue-50/60 dark:bg-blue-900/10 min-w-15">
                    Selisih
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => {
              const globalIdx = start + idx;
              const stripe = globalIdx % 2 !== 0 ? STRIPE_EVEN : STRIPE_ODD;
              return (
                <tr
                  key={`row-${row.nik}-${globalIdx}`}
                  className="transition-colors hover:bg-gray-200 dark:hover:bg-slate-700"
                >
                  <td
                    className={`px-3 py-2.5 text-muted-foreground border-b border-border sticky left-0 z-10 transition-colors ${stripe} ${STICKY_BORDER}`}
                  >
                    {globalIdx + 1}.
                  </td>
                  <td
                    className={`px-3 py-2.5 text-foreground font-medium border-b border-border sticky left-10 z-10 transition-colors ${stripe} ${STICKY_BORDER}`}
                  >
                    <div className="truncate max-w-35" title={row.nama_petani}>
                      {row.nama_petani}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground font-mono border-b border-r border-border">
                    {row.nik}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground border-b border-r border-border">
                    {row.poktan}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground border-b border-r border-border">
                    {row.gapoktan || <span className="text-muted-foreground/30">-</span>}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground border-b border-r border-border">
                    <div className="truncate max-w-25" title={row.kios_rdkk}>
                      {row.kios_rdkk}
                    </div>
                  </td>
                  {PUPUK_TYPES.map((p) => {
                    const pd = row.pupuk?.[p.key];
                    const aj = pd?.diajukan_kg ?? 0;
                    const tb = pd?.ditebus_kg ?? 0;
                    const sl = pd?.selisih_kg ?? 0;
                    return (
                      <Fragment key={`pupuk-${row.nik}-${p.key}-${globalIdx}`}>
                        <td className="px-2 py-2.5 text-right text-muted-foreground border-b border-r border-border">
                          {aj > 0 ? (
                            aj.toLocaleString('id-ID')
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-right text-muted-foreground border-b border-r border-border">
                          {tb > 0 ? (
                            tb.toLocaleString('id-ID')
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                        <td
                          className={`px-2 py-2.5 text-right font-medium border-b border-r border-border ${
                            sl > 0
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : sl < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground/30'
                          }`}
                        >
                          {sl !== 0 ? sl.toLocaleString('id-ID') : '-'}
                        </td>
                      </Fragment>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground border-b border-r border-border bg-green-50/30 dark:bg-green-900/10">
                    {row.total_pupuk_diajukan_kg?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground border-b border-r border-border bg-green-50/30 dark:bg-green-900/10">
                    {row.total_pupuk_ditebus_kg?.toLocaleString('id-ID')}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-semibold border-b border-r border-border bg-green-50/30 dark:bg-green-900/10 ${
                      row.selisih_total_kg > 0
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : row.selisih_total_kg < 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {row.selisih_total_kg?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-center border-b border-r border-border">
                    <StatusBadge status={row.status_tebus} />
                  </td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-muted-foreground">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'TEBUS LENGKAP': 'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
    'TEBUS SEBAGIAN': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    'TEBUS MELEBIHI': 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
    'BELUM MENEBUS': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'TIDAK ADA PENGAJUAN': 'bg-muted      text-muted-foreground',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
        colorMap[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}
