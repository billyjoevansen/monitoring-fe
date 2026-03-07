'use client';

import { FileSearch, AlertTriangle } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { useReconcile } from '@/hooks/useReconcile';
import ReconcileUploadSection from '@/components/reconcile/ReconcileUploadSection';
import ReconcileArchiveSection from '@/components/reconcile/ReconcileArchiveSection';
import SummaryCard from '@/components/SummaryCard';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import ErrorBanner from '@/components/ErrorBanner';

export default function ReconcilePage() {
  const user = useUser();
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
    saving,
    saved,
    handleProcess,
    handleSaveToArchive,
    handleReset,
    filteredDetail,
    searchQuery,
    handleFilteredDataChange,
  } = useReconcile();

  if (!canUpload) {
    return (
      <div>
        <PageHeader />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk upload file.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader withSubtitle />

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
            <SummaryCard
              label="Kios Tidak Sesuai"
              value={result.summary.kios.tidak_sesuai}
              color="purple"
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
          />

          <ReconcileTable data={result.detail} onFilteredDataChange={handleFilteredDataChange} />
        </>
      )}
    </div>
  );
}

function PageHeader({ withSubtitle = false }: { withSubtitle?: boolean }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <FileSearch className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Rekonsiliasi</h1>
        {withSubtitle && <p className="text-gray-500 mt-1">Bandingkan data RDKK dengan SIVERVAL</p>}
      </div>
    </div>
  );
}
