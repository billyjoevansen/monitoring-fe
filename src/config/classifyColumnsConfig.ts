import type { ClassifyColumn, SummaryCardColor } from '@/types';

export const CLASSIFY_COLUMNS: ClassifyColumn[] = [
  { key: 'nama_petani', label: 'Nama Petani' },
  { key: 'nik', label: 'NIK' },
  { key: 'poktan', label: 'Poktan' },
  { key: 'status', label: 'Status' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'total_pupuk_diajukan_kg', label: 'Diajukan (kg)' },
  { key: 'total_pupuk_ditebus_kg', label: 'Ditebus (kg)' },
  { key: 'selisih_total_kg', label: 'Selisih (kg)' },
];

// Mapping warna untuk SummaryCard
export const SUMMARY_CARD_COLOR_MAP: Record<SummaryCardColor, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300',
  green:
    'bg-green-50 border-green-200 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300',
  yellow:
    'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-300',
  red: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300',
  orange:
    'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300',
  purple:
    'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-300',
};
