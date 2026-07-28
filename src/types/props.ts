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
  onDownload?: () => void | Promise<void>;
}

export interface ResultTableProps {
  columns: ClassifyColumn[];
  data: ClassifyDetailItem[];
}
