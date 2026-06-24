import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 120000,
});

/** Health check */
export async function healthCheck() {
  const res = await api.get('/api/health');
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
  });
  return res.data;
}

/** Cek info model */
export async function getModelInfo() {
  const res = await api.get('/api/model/info');
  return res.data;
}

/** Konfigurasi */
export async function getConfig() {
  const res = await api.get('/api/config');
  // console.log('Config:', res.data);
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
