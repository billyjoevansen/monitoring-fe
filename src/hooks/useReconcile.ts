import { useCallback, useState } from 'react';
import { reconcile } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import { manageClient } from '@/lib/supabase/client';
import { getApiErrorMessage } from '@/lib/errors';
import type { ReconcileResult, User } from '@/types';

export function useReconcile(user: User) {
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
      setError(getApiErrorMessage(err));
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

  const handleReset = useCallback(() => {
    setResult(null);
    setRdkkFile(null);
    setSivervalFile(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
  }, []);

  const [filteredDetail, setFilteredDetail] = useState<Record<string, unknown>[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilteredDataChange = useCallback(
    (filtered: Record<string, unknown>[], query: string) => {
      setFilteredDetail(filtered);
      setSearchQuery(query);
    },
    [],
  );

  return {
    rdkkFile,
    sivervalFile,
    setRdkkFile,
    setSivervalFile,
    loading,
    result,
    error,
    namaArsip,
    setNamaArsip,
    saving,
    saved,
    handleProcess,
    handleSaveToArchive,
    handleReset,
    filteredDetail,
    searchQuery,
    handleFilteredDataChange,
  };
}
