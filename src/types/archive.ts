import type { StatusPenebusan, KiosSummary } from './rekonsiliasi';
import type { ClassificationSummary, ModelInfo } from './klasifikasi';

// ─── Base (useArchive & ArchiveListLayout) ──────────────────────────────

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

// ─── Reconciliation ──────────────────────────────────────────────────────────

export interface ReconciliationSummary {
  total_petani: number;
  status_penebusan: StatusPenebusan;
  kios: KiosSummary;
}

export interface ReconciliationArchive extends BaseArchive<ReconciliationSummary> {}

// ─── Classification ───────────────────────────────────────────────────────────

export interface ClassificationArchive extends BaseArchive<ClassificationSummary> {
  reconciliation_id: string | null;
  model_info: ModelInfo | null;
}
