// Ringkasan hasil klasifikasi
export interface ClassificationSummary {
  total_petani: number;
  normal: number;
  tidak_normal: number;
  persentase_normal: number;
  persentase_tidak_normal: number;
}

// Informasi model yang digunakan
export interface ModelInfo {
  accuracy: number;
  f1_score_weighted: number;
  oob_score?: number;
  model_file?: string;
}

// Detail item hasil klasifikasi
export interface ClassifyDetailItem {
  nama_petani?: string;
  nik?: string;
  poktan?: string;
  status?: string;
  confidence?: number;
  total_pupuk_diajukan_kg?: number;
  total_pupuk_ditebus_kg?: number;
  selisih_total_kg?: number;
  [key: string]: unknown; // Index signature untuk kompatibilitas
}

// Hasil lengkap klasifikasi
export interface ClassifyResult {
  summary: ClassificationSummary;
  detail: ClassifyDetailItem[];
  model_info: ModelInfo;
}

// Kolom tabel hasil klasifikasi
export interface ClassifyColumn {
  key: string;
  label: string;
}

export interface HyperParams {
  n_estimators: number;
  criterion: string;
  max_depth: number | null;
  max_features: string;
  min_samples_split: number;
  min_samples_leaf: number;
  class_weight: 'balanced' | 'balanced_subsample' | null;
  bootstrap: boolean;
  oob_score: boolean;
  random_state: number;
  n_jobs: number;
}

export interface TrainingConfig {
  test_size: number;
  random_state: number;
  stratify: boolean;
}
