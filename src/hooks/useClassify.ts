import { useEffect, useState } from 'react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { classify } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import { manageClient } from '@/lib/supabase/client';
import { ReconciliationArchive, ClassifyResult } from '@/types';

export function useClassify() {
  const user = useUser();
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
      const data = await classify(archive.detail);
      setResult(data);
      await logActivity(
        'classify',
        `Klasifikasi dari arsip "${archive.nama_arsip}" — ${data.summary.total_petani} petani`,
      );
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Terjadi kesalahan.');
      } else {
        setError('Gagal terhubung ke server.');
      }
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
      const { error: insertErr } = await supabase.from('classification_archives').insert({
        user_id: user.id,
        user_nama: user.nama,
        reconciliation_id: selectedArchive.id,
        nama_arsip: namaArsip.trim(),
        summary: result.summary,
        detail: result.detail,
      });

      if (insertErr) throw insertErr;

      await logActivity('save_classification', `Menyimpan arsip klasifikasi: ${namaArsip}`);
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
    setSelectedArchive(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return {
    // state
    user,
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
    // actions
    setNamaArsip,
    handleClassify,
    handleSaveToArchive,
    handleReset,
    toggleExpand,
    formatDate,
  };
}
