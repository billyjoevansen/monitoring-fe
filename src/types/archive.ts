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
  kecamatan?: string | null;
}

// Reconciliation

export interface ReconciliationSummary {
  total_petani: number;
  status_penebusan: StatusPenebusan;
  kios: KiosSummary;
  total_pupuk_diajukan_kg: number;
  total_pupuk_ditebus_kg: number;
  selisih_total_kg: number;
}

export interface ReconciliationArchive extends BaseArchive<ReconciliationSummary> {
  /** Wilayah kecamatan arsip ini. Null jika tidak diisi. */
  kecamatan: string | null;
}

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
  filterWilayah: string;
  onFilterWilayahChange: (value: string) => void;
  userKecamatan?: string | null;
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
  renderExpandedSummary: (archive: T) => ReactNode;
  // Bulk delete
  selectedIds: Set<string>;
  allSelected: boolean;
  bulkDeleting: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onBulkDelete: () => void;
}

export interface UseArchiveOptions<T extends BaseArchive> {
  table: string;
  deleteActivityKey: string;
  deleteActivityLabel: (archive: T) => string;
  filterByKecamatan?: string | null;
}
