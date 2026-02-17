import { PupukDetail } from './petani';

export interface PupukSummary {
  total_diajukan_kg: number;
  total_ditebus_kg: number;
  selisih_kg: number;
  persentase_tebus: number;
}

// Status penebusan petani

export interface StatusPenebusan {
  tebus_lengkap: number;
  tebus_sebagian: number;
  tebus_melebihi: number;
  belum_menebus: number;
  tidak_ada_pengajuan?: number;
}

// Ringkasan kios penebusan
export interface KiosSummary {
  sesuai: number;
  tidak_sesuai: number;
  persentase_sesuai: number;
}

// Ringkasan hasil rekonsiliasi
export interface ReconcileSummary {
  total_petani: number;
  status_penebusan: StatusPenebusan;
  kios: KiosSummary;
  pupuk: Record<string, PupukSummary>;
  total_pupuk_diajukan_kg: number;
  total_pupuk_ditebus_kg: number;
}

// Detail data per petani
export interface ReconcileDetailItem {
  nama_petani?: string;
  nik?: string;
  poktan?: string;
  gapoktan?: string;
  alamat?: string;
  penyuluh?: string;
  kios_rdkk?: string;
  kios_penebusan?: string;
  kios_sesuai?: boolean;
  total_luas_lahan_ha?: number;
  jumlah_mt_aktif?: number;
  pupuk?: Record<string, PupukDetail>;
  sp36_tebus_kg?: number;
  organik_cair_tebus_kg?: number;
  total_pupuk_diajukan_kg?: number;
  total_pupuk_ditebus_kg?: number;
  selisih_total_kg?: number;
  status_tebus?: string;
  catatan?: string[];
  [key: string]: unknown;
}

// Hasil lengkap rekonsiliasi
export interface ReconcileResult {
  summary: ReconcileSummary;
  detail: ReconcileDetailItem[];
}

// =====================
// Constants
// =====================

// Key pupuk yang digunakan dalam proses rekonsiliasi
export const PUPUK_KEYS = ['urea', 'npk', 'za', 'npk_formula', 'organik'] as const;
// Type untuk key pupuk
export type PupukKey = (typeof PUPUK_KEYS)[number];

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
