// ─── Reconciliation ──────────────────────────────────────────────────────────

export interface ReconciliationSummary {
  total_petani: number;
  status_penebusan: {
    tebus_lengkap: number;
    tebus_sebagian: number;
    tebus_melebihi: number;
    belum_menebus: number;
  };
  kios: {
    sesuai: number;
    tidak_sesuai: number;
    persentase_sesuai: number;
  };
}

export interface ReconciliationArchive {
  id: string;
  user_id: string;
  user_nama: string;
  nama_arsip: string;
  summary: ReconciliationSummary;
  detail: Record<string, unknown>[];
  created_at: string;
}

// ─── Classification ───────────────────────────────────────────────────────────

export interface ClassificationSummary {
  total_petani: number;
  normal: number;
  tidak_normal: number;
  persentase_normal: number;
  persentase_tidak_normal: number;
}

export interface ClassificationArchive {
  id: string;
  user_id: string;
  user_nama: string;
  reconciliation_id: string;
  nama_arsip: string;
  summary: ClassificationSummary;
  detail: Record<string, unknown>[];
  created_at: string;
}

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
