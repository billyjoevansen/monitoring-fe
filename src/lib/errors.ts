import { isAxiosError } from 'axios';

interface ApiErrorResponse {
  error?: string;
}

export function getApiErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    return (err.response?.data as ApiErrorResponse)?.error || 'Terjadi kesalahan.';
  }
  return 'Gagal terhubung ke server.';
}
