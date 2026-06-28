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

// Dot indicator colors untuk SummaryCard
export const SUMMARY_CARD_DOT_COLOR: Record<SummaryCardColor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-violet-500',
};
