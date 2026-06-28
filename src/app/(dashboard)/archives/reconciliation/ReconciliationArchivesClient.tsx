'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileStack, Download, Filter, MapPin } from 'lucide-react';
import { useArchive } from '@/hooks/useArchive';
import ArchiveListLayout from '@/components/archive/ArchiveListLayout';
import { ArchiveDetailHeader } from '@/components/archive/ArchiveDetailHeader';
import { ArchiveDeleteDialog } from '@/components/archive/ArchiveDeleteDialog';
import MiniCard from '@/components/ui/MiniCard';
import SummaryCard from '@/components/ui/SummaryCard';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import DownloadButtons from '@/components/ui/DownloadButtons';
import type { ReconciliationArchive, ReconcileDetailItem, ReconcileSummary, Role } from '@/types';

interface ReconciliationArchivesClientProps {
  canEdit: boolean;
  userRole: Role;
  userKecamatan: string | null;
}

export default function ReconciliationArchivesClient({
  canEdit,
  userRole,
  userKecamatan,
}: ReconciliationArchivesClientProps) {
  const filterByKecamatan = userRole === 'bpp' ? (userKecamatan ?? undefined) : undefined;

  const {
    filtered,
    loading,
    search,
    setSearch,
    submitSearch,
    filterWilayah,
    setFilterWilayah,
    viewingArchive,
    setViewingArchive,
    expandedId,
    toggleExpand,
    deleting,
    handleDelete,
    confirmDelete,
    cancelDelete,
    deleteDialogOpen,
    archiveToDelete,
    formatDate,
    selectedIds,
    allSelected,
    bulkDeleting,
    bulkDeleteDialogOpen,
    toggleSelectArchive,
    toggleSelectAll,
    handleBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete,
  } = useArchive<ReconciliationArchive>({
    table: 'reconciliation_archives',
    deleteActivityKey: 'delete_archive',
    deleteActivityLabel: (a) => `Menghapus arsip rekonsiliasi: ${a.nama_arsip}`,
    filterByKecamatan,
  });

  const [filteredDetail, setFilteredDetail] = useState<ReconcileDetailItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (viewingArchive) {
      setFilteredDetail(viewingArchive.detail as ReconcileDetailItem[]);
      setSearchQuery('');
    }
  }, [viewingArchive?.id]);

  const handleFilteredDataChange = useCallback((rows: Record<string, unknown>[], query: string) => {
    setFilteredDetail(rows as ReconcileDetailItem[]);
    setSearchQuery(query);
  }, []);

  if (viewingArchive) {
    const { summary } = viewingArchive;
    const downloadSummary = summary as unknown as ReconcileSummary;
    const fullDetail = viewingArchive.detail as ReconcileDetailItem[];

    const isFiltered = searchQuery.trim().length > 0;
    const downloadDetail = isFiltered ? filteredDetail : fullDetail;

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

        {viewingArchive.kecamatan && (
          <div className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{viewingArchive.kecamatan}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
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
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-foreground px-4 py-3 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-muted-foreground" />
            {isFiltered ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                <Filter className="w-3.5 h-3.5" />
                <span>
                  Download {filteredDetail.length} dari {fullDetail.length} data
                  {searchQuery ? ` (filter: "${searchQuery}")` : ''}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Unduh semua data ({fullDetail.length} petani)
              </span>
            )}
          </div>
          <DownloadButtons detail={downloadDetail} summary={downloadSummary} />
        </div>

        <ReconcileTable
          data={viewingArchive.detail}
          onFilteredDataChange={handleFilteredDataChange}
        />
      </div>
    );
  }

  const subtitle =
    userRole === 'bpp' && userKecamatan
      ? `Riwayat hasil rekonsiliasi wilayah ${userKecamatan}`
      : 'Riwayat hasil rekonsiliasi yang telah disimpan';

  return (
    <>
      <ArchiveListLayout
        icon={
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <FileStack className="w-5 h-5 text-amber-600" />
          </div>
        }
        title="Arsip Rekonsiliasi"
        subtitle={subtitle}
        emptyIcon={<FileStack className="w-full h-full" />}
        emptyTitle="Belum ada arsip rekonsiliasi."
        emptySubtitle="Lakukan rekonsiliasi dan simpan hasilnya."
        filtered={filtered}
        filterWilayah={filterWilayah}
        onFilterWilayahChange={setFilterWilayah}
        loading={loading}
        search={search}
        expandedId={expandedId}
        deleting={deleting}
        canEdit={canEdit}
        onSearchChange={setSearch}
        onSearchSubmit={submitSearch}
        onToggleExpand={toggleExpand}
        onView={setViewingArchive}
        onDelete={handleDelete}
        formatDate={formatDate}
        renderExpandedSummary={({ summary }) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <MiniCard label="Total Petani" value={summary.total_petani} />
            <MiniCard label="Tebus Lengkap" value={summary.status_penebusan.tebus_lengkap} />
            <MiniCard label="Tebus Sebagian" value={summary.status_penebusan.tebus_sebagian} />
          </div>
        )}
        selectedIds={selectedIds}
        allSelected={allSelected}
        bulkDeleting={bulkDeleting}
        onToggleSelect={toggleSelectArchive}
        onToggleSelectAll={toggleSelectAll}
        onBulkDelete={handleBulkDelete}
        userKecamatan={userKecamatan}
      />

      <ArchiveDeleteDialog
        open={deleteDialogOpen}
        isBulkDelete={false}
        archiveToDelete={archiveToDelete}
        bulkDeleteCount={0}
        deleting={!!deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <ArchiveDeleteDialog
        open={bulkDeleteDialogOpen}
        isBulkDelete={true}
        archiveToDelete={null}
        bulkDeleteCount={selectedIds.size}
        deleting={bulkDeleting}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
      />
    </>
  );
}
