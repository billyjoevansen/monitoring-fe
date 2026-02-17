'use client';

import { Fragment, useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import type { PupukDetail, PetaniRow, ReconcileDetailItem } from '@/types';

const PUPUK_TYPES = [
  { key: 'urea', label: 'Urea' },
  { key: 'npk', label: 'NPK' },
  { key: 'za', label: 'ZA' },
  { key: 'npk_formula', label: 'NPK Formula' },
  { key: 'organik', label: 'Organik' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ReconcileTable({ data }: { data: Record<string, unknown>[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [tableMaxHeight, setTableMaxHeight] = useState(500);

  // Hitung tinggi maksimal tabel berdasarkan sisa viewport
  useEffect(() => {
    const calculateHeight = () => {
      if (tableWrapperRef.current) {
        const rect = tableWrapperRef.current.getBoundingClientRect();
        // Sisa viewport dikurangi padding bawah (pagination ~56px + margin 32px)
        const available = window.innerHeight - rect.top - 88;
        setTableMaxHeight(Math.max(300, available));
      }
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  const rows = data as unknown as PetaniRow[];

  const filtered = rows.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      row.nama_petani?.toLowerCase().includes(q) ||
      row.nik?.toLowerCase().includes(q) ||
      row.poktan?.toLowerCase().includes(q) ||
      row.gapoktan?.toLowerCase().includes(q) ||
      row.status_tebus?.toLowerCase().includes(q) ||
      row.catatan?.some((c) => c.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageData = filtered.slice(start, start + pageSize);

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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-w-0">
      {/* Toolbar — fixed di atas */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, poktan, status..."
            autoComplete="off"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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

      <div
        ref={tableWrapperRef}
        className="overflow-auto h-96"
        // style={{ maxHeight: `${tableMaxHeight}px` }}
      >
        <table className="w-max min-w-full text-xs border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 sticky left-0 bg-gray-50 z-20 min-w-10"
              >
                No
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 sticky left-10 bg-gray-50 z-20 min-w-35 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
              >
                Nama Petani
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 min-w-30"
              >
                NIK
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 min-w-25"
              >
                Poktan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 min-w-25"
              >
                Gapoktan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 min-w-25"
              >
                Kios RDKK
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-left font-semibold text-gray-600 border-r border-gray-200 min-w-25"
              >
                Kios Tebus
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-center font-semibold text-gray-600 border-r border-gray-200 min-w-12.5"
              >
                Kios ✓
              </th>
              {PUPUK_TYPES.map((p) => (
                <th
                  key={`group-${p.key}`}
                  colSpan={3}
                  className="px-2 py-2 text-center font-semibold text-gray-600 border-r border-gray-200 bg-blue-50/50"
                >
                  {p.label}
                </th>
              ))}
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-gray-600 border-r border-gray-200 min-w-20 bg-green-50/50"
              >
                Tot. Ajukan
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-gray-600 border-r border-gray-200 min-w-20 bg-green-50/50"
              >
                Tot. Tebus
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-right font-semibold text-gray-600 border-r border-gray-200 min-w-17.5 bg-green-50/50"
              >
                Selisih
              </th>
              <th
                rowSpan={2}
                className="px-3 py-2 text-center font-semibold text-gray-600 border-r border-gray-200 min-w-27.5"
              >
                Status
              </th>
              <th rowSpan={2} className="px-3 py-2 text-left font-semibold text-gray-600 min-w-50">
                Catatan
              </th>
            </tr>
            <tr>
              {PUPUK_TYPES.map((p) => (
                <Fragment key={`sub-${p.key}`}>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-500 border-r border-gray-100 bg-blue-50/30 min-w-15">
                    Ajukan
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-500 border-r border-gray-100 bg-blue-50/30 min-w-15">
                    Tebus
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-500 border-r border-gray-200 bg-blue-50/30 min-w-15">
                    Selisih
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.map((row, idx) => {
              const globalIdx = start + idx;
              return (
                <tr
                  key={`row-${row.nik}-${globalIdx}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-gray-500 border-r border-gray-100 sticky left-0 bg-white z-5">
                    {globalIdx + 1}
                  </td>
                  <td className="px-3 py-2.5 text-gray-800 font-medium border-r border-gray-100 sticky left-10 bg-white z-5 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]">
                    <div className="truncate max-w-35" title={row.nama_petani}>
                      {row.nama_petani}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono border-r border-gray-100">
                    {row.nik}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 border-r border-gray-100">
                    {row.poktan}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 border-r border-gray-100">
                    {row.gapoktan}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 border-r border-gray-100">
                    <div className="truncate max-w-25" title={row.kios_rdkk}>
                      {row.kios_rdkk}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 border-r border-gray-100">
                    <div className="truncate max-w-25" title={row.kios_penebusan}>
                      {row.kios_penebusan}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center border-r border-gray-100">
                    {row.kios_sesuai ? (
                      <span className="inline-block w-5 h-5 bg-green-100 text-green-700 rounded-full text-[10px] leading-5 font-bold">
                        ✓
                      </span>
                    ) : (
                      <span className="inline-block w-5 h-5 bg-red-100 text-red-700 rounded-full text-[10px] leading-5 font-bold">
                        ✗
                      </span>
                    )}
                  </td>
                  {PUPUK_TYPES.map((p) => {
                    const pd = row.pupuk?.[p.key];
                    const aj = pd?.diajukan_kg ?? 0;
                    const tb = pd?.ditebus_kg ?? 0;
                    const sl = pd?.selisih_kg ?? 0;
                    return (
                      <Fragment key={`pupuk-${row.nik}-${p.key}-${globalIdx}`}>
                        <td className="px-2 py-2.5 text-right text-gray-600 border-r border-gray-50">
                          {aj > 0 ? (
                            aj.toLocaleString('id-ID')
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-right text-gray-600 border-r border-gray-50">
                          {tb > 0 ? (
                            tb.toLocaleString('id-ID')
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td
                          className={`px-2 py-2.5 text-right font-medium border-r border-gray-200 ${sl > 0 ? 'text-yellow-600' : sl < 0 ? 'text-red-600' : 'text-gray-300'}`}
                        >
                          {sl !== 0 ? sl.toLocaleString('id-ID') : '-'}
                        </td>
                      </Fragment>
                    );
                  })}
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-700 border-r border-gray-100 bg-green-50/20">
                    {row.total_pupuk_diajukan_kg?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-700 border-r border-gray-100 bg-green-50/20">
                    {row.total_pupuk_ditebus_kg?.toLocaleString('id-ID')}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-semibold border-r border-gray-100 bg-green-50/20 ${row.selisih_total_kg > 0 ? 'text-yellow-600' : row.selisih_total_kg < 0 ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {row.selisih_total_kg?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2.5 text-center border-r border-gray-100">
                    <StatusBadge status={row.status_tebus} />
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">
                    {row.catatan && row.catatan.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5">
                        {row.catatan.map((c, i) => (
                          <li key={`catatan-${globalIdx}-${i}`} className="text-[11px]">
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={99} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — fixed di bawah */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
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
                  className={`min-w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
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

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'TEBUS LENGKAP': 'bg-green-100 text-green-700',
    'TEBUS SEBAGIAN': 'bg-yellow-100 text-yellow-700',
    'TEBUS MELEBIHI': 'bg-red-100 text-red-700',
    'BELUM MENEBUS': 'bg-orange-100 text-orange-700',
    'TIDAK ADA PENGAJUAN': 'bg-gray-100 text-gray-600',
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}
    >
      {status}
    </span>
  );
}
