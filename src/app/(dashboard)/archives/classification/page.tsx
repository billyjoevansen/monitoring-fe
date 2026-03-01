'use client';

import { BrainCircuit } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { useArchive } from '@/hooks/useArchive';
import ArchiveListLayout from '@/components/archive/ArchiveListLayout';
import MiniCard from '@/components/MiniCard';
import SummaryCard from '@/components/SummaryCard';
import ResultTable from '@/components/ResultTable';
import type { ClassificationArchive } from '@/types';

const classifyColumns = [
  { key: 'nama_petani', label: 'Nama Petani' },
  { key: 'nik', label: 'NIK' },
  { key: 'poktan', label: 'Poktan' },
  { key: 'status', label: 'Status' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'kios_sesuai', label: 'Kios Sesuai' },
  { key: 'total_pupuk_diajukan_kg', label: 'Diajukan (kg)' },
  { key: 'total_pupuk_ditebus_kg', label: 'Ditebus (kg)' },
  { key: 'selisih_total_kg', label: 'Selisih (kg)' },
];

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
  } = useArchive<ClassificationArchive>({
    table: 'classification_archives',
    deleteActivityKey: 'delete_classification',
    deleteActivityLabel: (a) => `Menghapus arsip klasifikasi: ${a.nama_arsip}`,
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
            className="px-4 py-2 bg-indigo-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            ← Kembali
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            label="Total Petani"
            value={viewingArchive.summary.total_petani}
            color="blue"
          />
          <SummaryCard
            label="Normal"
            value={viewingArchive.summary.normal}
            sub={`${viewingArchive.summary.persentase_normal}%`}
            color="green"
          />
          <SummaryCard
            label="Tidak Normal"
            value={viewingArchive.summary.tidak_normal}
            sub={`${viewingArchive.summary.persentase_tidak_normal}%`}
            color="red"
          />
        </div>

        <ResultTable columns={classifyColumns} data={viewingArchive.detail} />
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
      renderExpandedSummary={(archive) => (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <MiniCard label="Total Petani" value={archive.summary.total_petani} />
          <MiniCard
            label="Normal"
            value={`${archive.summary.normal} (${archive.summary.persentase_normal}%)`}
          />
          <MiniCard
            label="Tidak Normal"
            value={`${archive.summary.tidak_normal} (${archive.summary.persentase_tidak_normal}%)`}
          />
        </div>
      )}
    />
  );
}
