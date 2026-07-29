import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 120000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error]', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

/** Health check */
export async function healthCheck(signal?: AbortSignal) {
  const res = await api.get('/api/health', { signal });
  return res.data;
}

/** Rekonsiliasi — upload 2 file */
export async function reconcile(rdkkFile: File, sivervalFile: File) {
  const formData = new FormData();
  formData.append('rdkk', rdkkFile);
  formData.append('siverval', sivervalFile);
  const res = await api.post('/api/reconcile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/** Klasifikasi — kirim data JSON dari arsip rekonsiliasi */
export async function classify(detail: Record<string, unknown>[]) {
  const res = await api.post('/api/classify', { detail });
  return res.data;
}

/** Training — upload 2 file */
export async function trainModel(rdkkFile: File, sivervalFile: File) {
  const formData = new FormData();
  formData.append('rdkk', rdkkFile);
  formData.append('siverval', sivervalFile);
  const res = await api.post('/api/train', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000, // 10 menit untuk training + tuning
  });
  return res.data;
}

/** Cek info model */
export async function getModelInfo() {
  const res = await api.get('/api/model/info');
  return res.data;
}

/** Konfigurasi */
export async function getConfig(signal?: AbortSignal) {
  const res = await api.get('/api/config', { signal });
  return res.data;
}

export async function updateConfig(config: unknown) {
  const res = await api.put('/api/config', config);
  return res.data;
}

export async function resetConfig() {
  const res = await api.post('/api/config/reset');
  return res.data;
}

/** Visualisasi */
export async function visualizeReconciliation(data: unknown) {
  const res = await api.post('/api/visualize/reconciliation', data);
  return res.data;
}

export async function visualizeTraining(data: unknown) {
  const res = await api.post('/api/visualize/training', data);
  return res.data;
}

/** Enkripsi NIK via backend (server-side) */
export async function encryptNikArray(
  detail: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  const res = await api.post('/api/encrypt-nik', { detail });
  return res.data.detail;
}

/** Dekripsi NIK via backend (server-side) */
export async function decryptNikArray(
  detail: Record<string, unknown>[],
): Promise<Record<string, unknown>[]> {
  const res = await api.post('/api/decrypt-nik', { detail });
  return res.data.detail;
}

/** Identifikasi kecamatan dari file Excel RDKK/SIVERVAL */
export async function identifyKecamatan(
  file: File,
  documentType: 'rdkk' | 'siverval',
): Promise<{ kecamatan: string[]; total_petani: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  const res = await api.post('/api/identify-kecamatan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/** Generate data dummy */
export interface GenerateDummyParams {
  n_petani: number;
  n_transaksi: number;
  seed?: number | null;
  pct_normal: number;
  pct_over: number;
  pct_kurang: number;
  kecamatan?: string | null;
}

export interface GenerateDummyResult {
  rdkk: { filename: string; content: string };
  siverval: { filename: string; content: string };
  summary: {
    n_petani: number;
    n_transaksi: number;
    seed: number;
    kecamatan: string;
    distribusi_skenario: Record<string, number>;
  };
}

export async function generateDummy(params: GenerateDummyParams): Promise<GenerateDummyResult> {
  const res = await api.post('/api/dummy/generate', params);
  return res.data;
}

/** Statistik global — ringkasan seluruh arsip */
export interface GlobalStatsData {
  reconciliation: {
    total_rdkk_docs: number;
    total_petani: number;
    total_lengkap: number;
    total_sebagian: number;
    total_melebihi: number;
    total_belum: number;
    persentase_lengkap: number;
  };
  classification: {
    total_siverval_docs: number;
    total_petani: number;
    total_normal: number;
    total_tidak_normal: number;
    rata_rata_akurasi: number;
    rata_rata_persentase_normal: number;
  };
  pupuk?: {
    per_jenis: Record<string, { diajukan_kg: number; ditebus_kg: number }>;
    total_diajukan_kg: number;
    total_ditebus_kg: number;
    persentase_tebus: number;
  };
  demografi?: {
    rata_rata_luas_lahan: number;
    rata_rata_mt: number;
    distribusi_mt: Record<string, number>;
  };
}

export async function getGlobalStats(signal?: AbortSignal): Promise<GlobalStatsData> {
  const res = await api.get('/api/stats/summary', { signal });
  return res.data;
}

/** Statistik per kecamatan */
export interface PerKecamatanPupukDistribusi {
  [jenis: string]: { diajukan_kg: number; ditebus_kg: number };
}

export interface PerKecamatanReconciliation {
  total_arsip: number;
  total_petani: number;
  total_lengkap: number;
  total_sebagian: number;
  total_melebihi: number;
  total_belum: number;
  persentase_lengkap: number;
  distribusi_pupuk: PerKecamatanPupukDistribusi;
}

export interface PerKecamatanClassification {
  total_arsip: number;
  total_petani: number;
  total_normal: number;
  total_tidak_normal: number;
  persentase_normal: number;
}

export interface PerKecamatanData {
  kecamatan: string;
  data_terbatas: boolean;
  reconciliation: PerKecamatanReconciliation;
  classification: PerKecamatanClassification;
}

export interface PerKecamatanResponse {
  data: PerKecamatanData[];
}

export async function getPerKecamatanStats(
  kecamatan?: string,
  signal?: AbortSignal,
): Promise<PerKecamatanData[]> {
  const params: Record<string, string> = {};
  if (kecamatan) params.kecamatan = kecamatan;
  const res = await api.get('/api/stats/per-kecamatan', { params, signal });
  return res.data.data;
}
