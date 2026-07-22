import { useEffect, useState } from 'react';
import { hasPermission } from '@/config/rbac';
import { classify, encryptNikArray, decryptNikArray } from '@/lib/api';
import { logActivity } from '@/lib/auth-client';
import { manageClient } from '@/lib/supabase/client';
import { getApiErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/format';

import type { ReconciliationArchive, ClassifyResult, User } from '@/types';

export function useClassify(user: User) {
  const canClassify = hasPermission(user.role, 'view_classification');

  const [archives, setArchives] = useState<ReconciliationArchive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<ReconciliationArchive | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [namaArsip, setNamaArsip] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    const supabase = manageClient();
    const { data } = await supabase
      .from('reconciliation_archives')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArchives(data as ReconciliationArchive[]);
    setLoading(false);
  };

  const handleClassify = async (archive: ReconciliationArchive) => {
    setSelectedArchive(archive);
    setClassifying(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setNamaArsip(`Klasifikasi - ${archive.nama_arsip}`);

    try {
      // Decrypt NIK via backend before sending to classify API
      const decryptedDetail = await decryptNikArray(archive.detail);
      const data = await classify(decryptedDetail);
      setResult(data);
      await logActivity(
        'classify',
        `Klasifikasi dari arsip "${archive.nama_arsip}" — ${data.summary.total_petani} petani`,
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setClassifying(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!result || !namaArsip.trim() || !selectedArchive) return;

    setSaving(true);
    setError(null);

    try {
      const supabase = manageClient();

      // Encrypt NIK via backend before saving to Supabase
      const encryptedDetail = await encryptNikArray(result.detail);

      const { error: insertErr } = await supabase.from('classification_archives').insert({
        user_id: user.id,
        user_nama: user.nama,
        reconciliation_id: selectedArchive.id,
        nama_arsip: namaArsip.trim(),
        summary: result.summary,
        detail: encryptedDetail,
        model_info: result.model_info,
      });

      if (insertErr) throw insertErr;

      await logActivity('save_classification', `Menyimpan arsip klasifikasi: ${namaArsip}`);
      setSaved(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedArchive(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return {
    canClassify,
    archives,
    selectedArchive,
    expandedId,
    loading,
    classifying,
    result,
    error,
    namaArsip,
    saving,
    saved,
    setNamaArsip,
    handleClassify,
    handleSaveToArchive,
    handleReset,
    toggleExpand,
    formatDate,
  };
}
