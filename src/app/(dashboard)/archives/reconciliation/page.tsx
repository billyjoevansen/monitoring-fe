'use client';

import { FileStack } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/config/rbac';
import { useArchive } from '@/hooks/useArchive';
import ArchiveListLayout from '@/components/archive/ArchiveListLayout';
import { ArchiveDetailHeader } from '@/components/archive/ArchiveDetailHeader';
import MiniCard from '@/components/ui/MiniCard';
import SummaryCard from '@/components/ui/SummaryCard';
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
    selectedIds,
    allSelected,
    bulkDeleting,
    toggleSelectArchive,
    toggleSelectAll,
    handleBulkDelete,
  } = useArchive<ReconciliationArchive>({
    table: 'reconciliation_archives',
    deleteActivityKey: 'delete_archive',
    deleteActivityLabel: (a) => `Menghapus arsip rekonsiliasi: ${a.nama_arsip}`,
  });

  if (viewingArchive) {
    const { summary } = viewingArchive;
    return (
      <div>
        <ArchiveDetailHeader
          title={viewingArchive.nama_arsip}
          userName={viewingArchive.user_nama}
          createdAt={viewingArchive.created_at}
          totalPetani={summary.total_petani}
          onBack={() => setViewingArchive(null)}
          formatDate={formatDate}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <SummaryCard label="Total Petani" value={summary.total_petani} color="blue" />
          <SummaryCard
            label="Tebus Lengkap"
            value={summary.status_penebusan.tebus_lengkap}
            color="green"
          />
          <SummaryCard
            label="Tebus Sebagian"
            value={summary.status_penebusan.tebus_sebagian}
            color="yellow"
          />
          <SummaryCard
            label="Tebus Melebihi"
            value={summary.status_penebusan.tebus_melebihi}
            color="red"
          />
          <SummaryCard
            label="Belum Menebus"
            value={summary.status_penebusan.belum_menebus}
            color="orange"
          />
          <SummaryCard label="Kios Tidak Sesuai" value={summary.kios.tidak_sesuai} color="purple" />
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
      renderExpandedSummary={({ summary }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <MiniCard label="Total Petani" value={summary.total_petani} />
          <MiniCard label="Tebus Lengkap" value={summary.status_penebusan.tebus_lengkap} />
          <MiniCard label="Tebus Sebagian" value={summary.status_penebusan.tebus_sebagian} />
          <MiniCard label="Kios Sesuai" value={`${summary.kios.persentase_sesuai}%`} />
        </div>
      )}
      selectedIds={selectedIds}
      allSelected={allSelected}
      bulkDeleting={bulkDeleting}
      onToggleSelect={toggleSelectArchive}
      onToggleSelectAll={toggleSelectAll}
      onBulkDelete={handleBulkDelete}
    />
  );
}
