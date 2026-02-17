export * from './rekonsiliasi';
export * from './klasifikasi';
export * from './petani';
export * from './props';

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
  | 'view_archives'
  | 'manage_archives';

// Navbar
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  children?: NavItem[];
}

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

// TRAINING RESULT
export interface ModelPerformance {
  accuracy: number;
  f1_score_weighted: number;
  oob_score?: number;
  classification_report?: string;
  confusion_matrix?: number[][];
}

export interface FeatureSelection {
  total_fitur_awal: number;
  total_fitur_terpilih: number;
  fitur_terpilih?: string[];
}

export interface ModelFile {
  path?: string;
  size_kb?: number;
}

export interface TrainResult {
  model_performance: ModelPerformance;
  feature_selection?: FeatureSelection;
  model_file?: ModelFile;
}
