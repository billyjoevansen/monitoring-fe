'use client';

import { FileStack } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { useArchive } from '@/hooks/useArchive';
import ArchiveListLayout from '@/components/archive/ArchiveListLayout';
import MiniCard from '@/components/MiniCard';
import SummaryCard from '@/components/SummaryCard';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import type { ReconciliationArchive } from '@/types';

export default function ReconciliationArchivesPage() {
  const user = useUser();
  const canEdit = hasPermission(user.role, 'manage_archives');

  const {
    filtered,
    loading,
    search,
    setSearch,
    viewingArchive,
    setViewingArchive,
    expandedId,
    toggleExpand,
    deleting,
    handleDelete,
    formatDate,
  } = useArchive<ReconciliationArchive>({
    table: 'reconciliation_archives',
    deleteActivityKey: 'delete_archive',
    deleteActivityLabel: (a) => `Menghapus arsip rekonsiliasi: ${a.nama_arsip}`,
  });

  // Mode: viewing detail
  if (viewingArchive) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{viewingArchive.nama_arsip}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewingArchive.user_nama} · {formatDate(viewingArchive.created_at)} ·{' '}
              {viewingArchive.summary.total_petani} petani
            </p>
          </div>
          <button
            onClick={() => setViewingArchive(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            ← Kembali
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <SummaryCard
            label="Total Petani"
            value={viewingArchive.summary.total_petani}
            color="blue"
          />
          <SummaryCard
            label="Tebus Lengkap"
            value={viewingArchive.summary.status_penebusan.tebus_lengkap}
            color="green"
          />
          <SummaryCard
            label="Tebus Sebagian"
            value={viewingArchive.summary.status_penebusan.tebus_sebagian}
            color="yellow"
          />
          <SummaryCard
            label="Tebus Melebihi"
            value={viewingArchive.summary.status_penebusan.tebus_melebihi}
            color="red"
          />
          <SummaryCard
            label="Belum Menebus"
            value={viewingArchive.summary.status_penebusan.belum_menebus}
            color="orange"
          />
          <SummaryCard
            label="Kios Tidak Sesuai"
            value={viewingArchive.summary.kios.tidak_sesuai}
            color="purple"
          />
        </div>

        <ReconcileTable data={viewingArchive.detail} />
      </div>
    );
  }

  return (
    <ArchiveListLayout
      icon={
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <FileStack className="w-5 h-5 text-amber-600" />
        </div>
      }
      title="Arsip Rekonsiliasi"
      subtitle="Riwayat hasil rekonsiliasi yang telah disimpan"
      emptyIcon={<FileStack className="w-full h-full" />}
      emptyTitle="Belum ada arsip rekonsiliasi."
      emptySubtitle="Lakukan rekonsiliasi dan simpan hasilnya."
      filtered={filtered}
      loading={loading}
      search={search}
      expandedId={expandedId}
      deleting={deleting}
      canEdit={canEdit}
      onSearchChange={setSearch}
      onToggleExpand={toggleExpand}
      onView={setViewingArchive}
      onDelete={handleDelete}
      formatDate={formatDate}
      renderExpandedSummary={(archive) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <MiniCard label="Total Petani" value={archive.summary.total_petani} />
          <MiniCard label="Tebus Lengkap" value={archive.summary.status_penebusan.tebus_lengkap} />
          <MiniCard
            label="Tebus Sebagian"
            value={archive.summary.status_penebusan.tebus_sebagian}
          />
          <MiniCard label="Kios Sesuai" value={`${archive.summary.kios.persentase_sesuai}%`} />
        </div>
      )}
    />
  );
}
