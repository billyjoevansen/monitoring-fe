'use client';

import { useState } from 'react';
import { Loader2, FileSearch, AlertTriangle, XCircle, Save, CheckCircle } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { reconcile } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import FileUploader from '@/components/FileUploader';
import ReconcileTable from '@/components/ReconcileTable';
import SummaryCard from '@/components/SummaryCard';
import DownloadButtons from '@/components/DownloadButtons';
import { ReconcileResult } from '@/types';

export default function ReconcilePage() {
  const user = useUser();
  const canUpload = hasPermission(user.role, 'upload_files');

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
      const supabase = createClient();
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

  if (!canUpload) {
    return (
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Rekonsiliasi</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk upload file.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileSearch className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rekonsiliasi</h1>
          <p className="text-gray-500 mt-1">Bandingkan data RDKK dengan SIVERVAL</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex gap-6">
          <FileUploader
            label="Data RDKK"
            description="File Excel data pengajuan pupuk"
            file={rdkkFile}
            onFileChange={setRdkkFile}
          />
          <FileUploader
            label="Data SIVERVAL"
            description="File Excel data penebusan pupuk"
            file={sivervalFile}
            onFileChange={setSivervalFile}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleProcess}
            disabled={loading || !rdkkFile || !sivervalFile}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <FileSearch className="w-5 h-5" />
                Mulai Rekonsiliasi
              </>
            )}
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <SummaryCard label="Total Petani" value={result.summary.total_petani} color="blue" />
            <SummaryCard
              label="Tebus Lengkap"
              value={result.summary.status_penebusan.tebus_lengkap}
              color="green"
            />
            <SummaryCard
              label="Tebus Sebagian"
              value={result.summary.status_penebusan.tebus_sebagian}
              color="yellow"
            />
            <SummaryCard
              label="Tebus Melebihi"
              value={result.summary.status_penebusan.tebus_melebihi}
              color="red"
            />
            <SummaryCard
              label="Belum Menebus"
              value={result.summary.status_penebusan.belum_menebus}
              color="orange"
            />
            <SummaryCard
              label="Kios Tidak Sesuai"
              value={result.summary.kios.tidak_sesuai}
              color="purple"
            />
          </div>

          {/* Save & Download Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
            {saved ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Tersimpan ke arsip!</span>
                </div>
                <DownloadButtons detail={result.detail} summary={result.summary} />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={namaArsip}
                  onChange={(e) => setNamaArsip(e.target.value)}
                  placeholder="Nama arsip (misal: Rekon Kec. Serang Jan 2025)"
                  autoComplete="off"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToArchive}
                    disabled={saving || !namaArsip.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan
                  </button>
                  <DownloadButtons detail={result.detail} summary={result.summary} />
                </div>
              </div>
            )}
          </div>

          {/* Detail Table */}
          <ReconcileTable data={result.detail} />
        </>
      )}
    </div>
  );
}
