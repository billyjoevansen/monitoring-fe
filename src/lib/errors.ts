import { isAxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
  details?: string[];
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Data yang dikirim tidak valid.',
  401: 'Sesi berakhir. Silakan login ulang.',
  403: 'Anda tidak memiliki akses.',
  404: 'Data tidak ditemukan.',
  413: 'Ukuran file terlalu besar.',
  422: 'Data tidak dapat diproses.',
  429: 'Terlalu banyak permintaan. Silakan coba lagi.',
  500: 'Terjadi kesalahan server. Silakan coba lagi.',
};

export function getApiErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (!err.response) {
      return 'Gagal terhubung ke server. Periksa koneksi Anda.';
    }
    const data = err.response.data as ApiErrorResponse;
    if (data.details?.length) return data.details.join(', ');
    if (data.error) return data.error;
    return STATUS_MESSAGES[err.response.status] || 'Terjadi kesalahan.';
  }
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan yang tidak diketahui.';
}
