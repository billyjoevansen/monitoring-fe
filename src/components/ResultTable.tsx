'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import type { ResultTableProps, ClassifyDetailItem, SortDirection, SortConfig } from '@/types';

/**
 * Tipe untuk sorting
 */

/**
 * Status color mapping untuk klasifikasi
 */
const STATUS_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800',
  TIDAK_NORMAL: 'bg-red-100 text-red-800',
};

/**
 * Komponen tabel untuk menampilkan hasil klasifikasi
 */
export default function ResultTable({ columns, data }: ResultTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'nama_petani',
    direction: 'asc',
  });

  // Filter data berdasarkan search term
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

  // Sort data
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

  // Handle sort
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

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-3 h-3 text-gray-300" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-600" />
    );
  };

  // Format cell value
  const formatCellValue = (item: ClassifyDetailItem, key: string): React.ReactNode => {
    const value = item[key];

    switch (key) {
      case 'kios_sesuai':
        return value ? (
          <span className="text-green-600">Ya</span>
        ) : (
          <span className="text-red-600">Tidak</span>
        );
      case 'status':
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[String(value)] || 'bg-gray-100 text-gray-800'
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, poktan, atau status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Menampilkan {sortedData.length} dari {data.length} data
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">No</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
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
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    {formatCellValue(item, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
