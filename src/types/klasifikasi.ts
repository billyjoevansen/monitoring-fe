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
  kios_sesuai?: boolean;
  total_pupuk_diajukan_kg?: number;
  total_pupuk_ditebus_kg?: number;
  selisih_total_kg?: number;
  [key: string]: unknown; // Index signature untuk kompatibilitas
}

// Hasil lengkap klasifikasi
export interface ClassifyResult {
  summary: ClassificationSummary;
  detail: ClassifyDetailItem[];
}

// Kolom tabel hasil klasifikasi
export interface ClassifyColumn {
  key: string;
  label: string;
}
