import { useCallback, useState } from 'react';
import { reconcile, encryptNikArray } from '@/lib/api';
import { logActivity } from '@/lib/auth-client';
import { manageClient } from '@/lib/supabase/client';
import { getApiErrorMessage } from '@/lib/errors';

import type { ReconcileResult, User } from '@/types';

interface UseReconcileOptions {
  rdkkFile: File | null;
  sivervalFile: File | null;
  onRdkkChange: (file: File | null) => void;
  onSivervalChange: (file: File | null) => void;
}

export function useReconcile(user: User, options: UseReconcileOptions) {
  const { rdkkFile, sivervalFile, onRdkkChange, onSivervalChange } = options;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [namaArsip, setNamaArsip] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [kecamatan, setKecamatan] = useState<string>(() =>
    user.role === 'bpp' ? (user.kecamatan ?? '') : '',
  );

  const handleProcess = useCallback(async () => {
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
  }, [rdkkFile, sivervalFile]);

  const handleSaveToArchive = useCallback(async () => {
    if (!result || !namaArsip.trim()) {
      setError('Masukkan nama arsip.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = manageClient();

      // Encrypt NIK via backend before saving to Supabase
      const encryptedDetail = await encryptNikArray(result.detail);

      const { error: insertErr } = await supabase.from('reconciliation_archives').insert({
        user_id: user.id,
        user_nama: user.nama,
        nama_arsip: namaArsip.trim(),
        summary: result.summary,
        detail: encryptedDetail,
        kecamatan: kecamatan.trim() || null,
      });

      if (insertErr) throw insertErr;

      await logActivity(
        'save_archive',
        `Menyimpan arsip rekonsiliasi: ${namaArsip}${kecamatan ? ` (${kecamatan})` : ''}`,
      );
      setSaved(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [result, namaArsip, kecamatan, user]);

  const handleReset = useCallback(() => {
    setResult(null);
    onRdkkChange(null);
    onSivervalChange(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
    setKecamatan(user.role === 'bpp' ? (user.kecamatan ?? '') : '');
  }, [user, onRdkkChange, onSivervalChange]);

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
    loading,
    result,
    error,
    namaArsip,
    setNamaArsip,
    kecamatan,
    setKecamatan,
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
