import { ReconcileSummary, ReconcileDetailItem } from './rekonsiliasi';
import { ClassifyDetailItem, ClassifyColumn } from './klasifikasi';

export interface MiniCardProps {
  label: string;
  value: number | string;
}

// Props untuk komponen SummaryCard
export interface SummaryCardProps {
  label: string;
  value: number;
  sub?: string;
  color: SummaryCardColor;
}

// Warna yang tersedia untuk SummaryCard
export type SummaryCardColor = 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'purple';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

// Props untuk komponen DownloadButtons
export interface DownloadButtonsProps {
  detail: ReconcileDetailItem[];
  summary: ReconcileSummary;
}

export interface ResultTableProps {
  columns: ClassifyColumn[];
  data: ClassifyDetailItem[];
}

// Mapping warna untuk SummaryCard
export const SUMMARY_CARD_COLOR_MAP: Record<SummaryCardColor, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  red: 'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
};

// Kolom default tabel klasifikasi
export const CLASSIFY_COLUMNS: ClassifyColumn[] = [
  { key: 'nama_petani', label: 'Nama Petani' },
  { key: 'nik', label: 'NIK' },
  { key: 'poktan', label: 'Poktan' },
  { key: 'status', label: 'Status' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'kios_sesuai', label: 'Kios Sesuai' },
  { key: 'total_pupuk_diajukan_kg', label: 'Diajukan (kg)' },
  { key: 'total_pupuk_ditebus_kg', label: 'Ditebus (kg)' },
  { key: 'selisih_total_kg', label: 'Selisih (kg)' },
];
