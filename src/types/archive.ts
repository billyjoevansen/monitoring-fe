import type { ReactNode } from 'react';
import type { StatusPenebusan, KiosSummary } from './rekonsiliasi';
import type { ClassificationSummary, ModelInfo } from './klasifikasi';

//Base (useArchive & ArchiveListLayout)

/** Semua archive summary wajib punya total_petani */
export interface BaseSummary {
  total_petani: number;
}

export interface BaseArchive<TSummary extends BaseSummary = BaseSummary> {
  id: string;
  user_id: string;
  user_nama: string;
  nama_arsip: string;
  summary: TSummary;
  detail: Record<string, unknown>[];
  created_at: string;
}

// Reconciliation

export interface ReconciliationSummary {
  total_petani: number;
  status_penebusan: StatusPenebusan;
  kios: KiosSummary;
}

export interface ReconciliationArchive extends BaseArchive<ReconciliationSummary> {}

// Classification

export interface ClassificationArchive extends BaseArchive<ClassificationSummary> {
  reconciliation_id: string | null;
  model_info: ModelInfo | null;
}

// Props

export interface ArchiveDetailHeaderProps {
  title: string;
  userName: string;
  createdAt: string;
  totalPetani: number;
  onBack: () => void;
  backButtonColor?: string;
  formatDate: (dateStr: string) => string;
}

export interface ArchiveListLayoutProps<T extends BaseArchive<BaseSummary>> {
  /** Icon + warna header */
  icon: ReactNode;
  title: string;
  subtitle: string;
  /** Teks empty state */
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  // Data & state dari useArchive
  filtered: T[];
  loading: boolean;
  search: string;
  expandedId: string | null;
  deleting: string | null;
  canEdit: boolean;
  onSearchChange: (v: string) => void;
  onToggleExpand: (id: string) => void;
  onView: (archive: T) => void;
  onDelete: (archive: T) => void;
  formatDate: (dateStr: string) => string;
  /** Render summary mini cards di expanded row */
  renderExpandedSummary: (archive: T) => ReactNode;
}

export interface UseArchiveOptions<T extends BaseArchive> {
  table: string;
  deleteActivityKey: string;
  deleteActivityLabel: (archive: T) => string;
}
