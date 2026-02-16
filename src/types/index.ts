// ROLE & PERMISSION
export type Role = 'admin' | 'kabid' | 'kasie' | 'bpp';

export type Permission =
  | 'view_reconciliation'
  | 'view_prediction'
  | 'view_classification'
  | 'view_training'
  | 'upload_files'
  | 'train_model'
  | 'edit_model_config'
  | 'manage_users'
  | 'view_logs'
  | 'manage_archives';

// USER
export interface User {
  id: string;
  email: string;
  nama: string;
  role: Role;
  kecamatan: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// KECAMATAN
export interface Kecamatan {
  id: number;
  nama: string;
  kode: string;
}

// ACTIVITY LOG
export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_nama: string;
  user_role: string;
  action: string;
  detail: string | null;
  created_at: string;
}

// ARSIP REKONSILIASI
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

// ARSIP KLASIFIKASI
export interface ClassificationSummary {
  total_petani: number;
  normal: number;
  tidak_normal: number;
  persentase_normal: number;
  persentase_tidak_normal: number;
}

export interface ModelInfo {
  accuracy: number;
  f1_score_weighted: number;
  oob_score?: number;
  model_file?: string;
}

export interface ClassificationArchive {
  id: string;
  user_id: string;
  user_nama: string;
  reconciliation_id: string | null;
  nama_arsip: string;
  summary: ClassificationSummary;
  detail: Record<string, unknown>[];
  model_info: ModelInfo | null;
  created_at: string;
}
