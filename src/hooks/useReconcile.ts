import { useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { reconcile } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import { manageClient } from '@/lib/supabase/client';
import { ReconcileResult } from '@/types';

export function useReconcile() {
  const user = useUser();

  const [rdkkFile, setRdkkFile] = useState<File | null>(null);
  const [sivervalFile, setSivervalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [namaArsip, setNamaArsip] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProcess = async () => {
    if (!rdkkFile || !sivervalFile) {
      setError('Upload kedua file terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const data = await reconcile(rdkkFile, sivervalFile);
      setResult(data);
      setNamaArsip(rdkkFile.name.replace(/\.[^/.]+$/, ''));
      await logActivity('reconcile', `Rekonsiliasi ${data.summary.total_petani} petani`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Terjadi kesalahan.');
      } else {
        setError('Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!result || !namaArsip.trim()) {
      setError('Masukkan nama arsip.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = manageClient();
      const { error: insertErr } = await supabase.from('reconciliation_archives').insert({
        user_id: user.id,
        user_nama: user.nama,
        nama_arsip: namaArsip.trim(),
        summary: result.summary,
        detail: result.detail,
      });

      if (insertErr) throw insertErr;

      await logActivity('save_archive', `Menyimpan arsip rekonsiliasi: ${namaArsip}`);
      setSaved(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRdkkFile(null);
    setSivervalFile(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
  };

  return {
    // File state
    rdkkFile,
    sivervalFile,
    setRdkkFile,
    setSivervalFile,
    // Process state
    loading,
    result,
    error,
    // Archive state
    namaArsip,
    setNamaArsip,
    saving,
    saved,
    // Handlers
    handleProcess,
    handleSaveToArchive,
    handleReset,
  };
}
