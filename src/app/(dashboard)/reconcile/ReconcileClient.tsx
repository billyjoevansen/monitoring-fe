'use client';

import { FileSearch, AlertTriangle } from 'lucide-react';
import { hasPermission } from '@/config/rbac';
import { useReconcile } from '@/hooks/useReconcile';
import ReconcileUploadSection from '@/components/reconcile/ReconcileUploadSection';
import ReconcileArchiveSection from '@/components/reconcile/ReconcileArchiveSection';
import SummaryCard from '@/components/ui/SummaryCard';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import ErrorBanner from '@/components/ui/ErrorBanner';
import type { User } from '@/types';
import Hero from '@/components/ui/Hero';

export default function ReconcileClient({ user }: { user: User }) {
  const canUpload = hasPermission(user.role, 'upload_files');

  const {
    rdkkFile,
    sivervalFile,
    setRdkkFile,
    setSivervalFile,
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
  } = useReconcile(user);

  if (!canUpload) {
    return (
      <div>
        <Hero
          icon={<FileSearch className="w-8 h-8 text-foreground" />}
          title="Akses Ditolak"
          subtitle="Anda tidak memiliki izin untuk mengakses halaman ini."
        />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk upload file.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <Hero
          icon={<FileSearch className="w-8 h-8 text-foreground" />}
          title="Rekonsiliasi"
          subtitle="Pencocokan data RDKK dengan SIVERVAL"
        />
      )}

      <ReconcileUploadSection
        rdkkFile={rdkkFile}
        sivervalFile={sivervalFile}
        loading={loading}
        hasResult={!!result}
        onRdkkChange={setRdkkFile}
        onSivervalChange={setSivervalFile}
        onProcess={handleProcess}
        onReset={handleReset}
      />

      <ErrorBanner message={error} />

      {result && (
        <>
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
          </div>

          <ReconcileArchiveSection
            result={result}
            namaArsip={namaArsip}
            saving={saving}
            saved={saved}
            onNamaArsipChange={setNamaArsip}
            onSave={handleSaveToArchive}
            filteredDetail={filteredDetail}
            searchQuery={searchQuery}
            kecamatan={kecamatan}
            onKecamatanChange={setKecamatan}
            userKecamatan={user.role === 'bpp' ? (user.kecamatan ?? null) : null}
          />

          <ReconcileTable data={result.detail} onFilteredDataChange={handleFilteredDataChange} />
        </>
      )}
    </div>
  );
}
