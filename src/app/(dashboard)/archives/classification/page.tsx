'use client';

import { BrainCircuit } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/config/rbac';
import { useArchive } from '@/hooks/useArchive';
import ArchiveListLayout from '@/components/archive/ArchiveListLayout';
import { ArchiveDetailHeader } from '@/components/archive/ArchiveDetailHeader';
import MiniCard from '@/components/ui/MiniCard';
import SummaryCard from '@/components/ui/SummaryCard';
import ResultTable from '@/components/ui/ResultTable';
import { CLASSIFY_COLUMNS } from '@/config/classifyColumnsConfig';
import type { ClassificationArchive } from '@/types';

export default function ClassificationArchivesPage() {
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
  } = useArchive<ClassificationArchive>({
    table: 'classification_archives',
    deleteActivityKey: 'delete_classification',
    deleteActivityLabel: (a) => `Menghapus arsip klasifikasi: ${a.nama_arsip}`,
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
          backButtonColor="bg-indigo-100"
          formatDate={formatDate}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard label="Total Petani" value={summary.total_petani} color="blue" />
          <SummaryCard
            label="Normal"
            value={summary.normal}
            sub={`${summary.persentase_normal}%`}
            color="green"
          />
          <SummaryCard
            label="Tidak Normal"
            value={summary.tidak_normal}
            sub={`${summary.persentase_tidak_normal}%`}
            color="red"
          />
        </div>

        <ResultTable columns={CLASSIFY_COLUMNS} data={viewingArchive.detail} />
      </div>
    );
  }

  return (
    <ArchiveListLayout
      icon={
        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-violet-600" />
        </div>
      }
      title="Arsip Klasifikasi"
      subtitle="Riwayat hasil klasifikasi yang telah disimpan"
      emptyIcon={<BrainCircuit className="w-full h-full" />}
      emptyTitle="Belum ada arsip klasifikasi."
      emptySubtitle="Lakukan klasifikasi dan simpan hasilnya."
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
        <div className="grid grid-cols-3 gap-3 text-sm">
          <MiniCard label="Total Petani" value={summary.total_petani} />
          <MiniCard label="Normal" value={`${summary.normal} (${summary.persentase_normal}%)`} />
          <MiniCard
            label="Tidak Normal"
            value={`${summary.tidak_normal} (${summary.persentase_tidak_normal}%)`}
          />
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
