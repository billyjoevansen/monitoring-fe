'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import type { ResultTableProps, ClassifyDetailItem, SortConfig } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  TIDAK_NORMAL: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

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

  useEffect(() => {
    onFilteredDataChange?.(filteredData, searchTerm);
  }, [searchTerm, data]);

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
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, NIK, poktan, atau status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg text-sm bg-background text-foregroundfocus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Menampilkan {sortedData.length} dari {data.length} data
        </p>
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
            {sortedData.map((item, idx) => (
              <tr key={idx} className="transition-colors hover:bg-gray-200 dark:hover:bg-slate-800">
                <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-foreground">
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
