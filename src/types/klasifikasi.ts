// Ringkasan hasil klasifikasi
export interface ClassificationSummary {
  total_petani: number;
  normal: number;
  tidak_normal: number;
  persentase_normal: number;
  persentase_tidak_normal: number;
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

//  Arsip klasifikasi dari database
export interface ClassificationArchive {
  id: string;
  user_id: string;
  user_nama: string;
  reconciliation_id: string;
  nama_arsip: string;
  summary: ClassificationSummary;
  detail: ClassifyDetailItem[];
  created_at: string;
}

// Kolom tabel hasil klasifikasi
export interface ClassifyColumn {
  key: string;
  label: string;
}
