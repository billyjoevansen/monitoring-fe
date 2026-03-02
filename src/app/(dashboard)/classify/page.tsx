'use client';

import {
  Loader2,
  Tags,
  AlertTriangle,
  CheckCircle,
  Save,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import ResultTable from '@/components/ResultTable';
import SummaryCard from '@/components/SummaryCard';
import MiniCard from '@/components/MiniCard';
import ErrorBanner from '@/components/ErrorBanner';
import { ReconciliationArchive, CLASSIFY_COLUMNS } from '@/types';
import { useClassify } from '@/hooks/useClassify';

export default function ClassifyPage() {
  const {
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
  } = useClassify();

  if (!canClassify) {
    return (
      <div>
        <PageHeader />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses ke halaman ini.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader />

      <ErrorBanner message={error} />

      {!result && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Pilih Arsip Rekonsiliasi</h2>
            <p className="text-xs text-gray-500 mt-1">
              Data yang dipilih akan diproses menggunakan model Random Forest
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : archives.length === 0 ? (
            <EmptyArchiveState />
          ) : (
            <div className="divide-y divide-gray-100">
              {archives.map((archive) => (
                <ArchiveItem
                  key={archive.id}
                  archive={archive}
                  isExpanded={expandedId === archive.id}
                  isClassifying={classifying && selectedArchive?.id === archive.id}
                  onToggleExpand={() => toggleExpand(archive.id)}
                  onClassify={() => handleClassify(archive)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {result && selectedArchive && (
        <>
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Hasil klasifikasi dari arsip: <strong>{selectedArchive.nama_arsip}</strong>
            </span>
            <button
              onClick={handleReset}
              className="ml-auto text-indigo-600 hover:text-indigo-800 font-medium underline text-xs"
            >
              Pilih arsip lain
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <SummaryCard label="Total Petani" value={result.summary.total_petani} color="blue" />
            <SummaryCard
              label="Normal"
              value={result.summary.normal}
              sub={`${result.summary.persentase_normal}%`}
              color="green"
            />
            <SummaryCard
              label="Tidak Normal"
              value={result.summary.tidak_normal}
              sub={`${result.summary.persentase_tidak_normal}%`}
              color="red"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
            {saved ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Tersimpan ke arsip klasifikasi!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={namaArsip}
                  onChange={(e) => setNamaArsip(e.target.value)}
                  placeholder="Nama arsip klasifikasi"
                  autoComplete="off"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSaveToArchive}
                  disabled={saving || !namaArsip.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Simpan ke Arsip
                </button>
              </div>
            )}
          </div>

          <ResultTable columns={CLASSIFY_COLUMNS} data={result.detail} />
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Tags className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Klasifikasi</h1>
        <p className="text-gray-500 mt-1">
          Pilih arsip rekonsiliasi untuk diklasifikasikan NORMAL / TIDAK NORMAL
        </p>
      </div>
    </div>
  );
}

function EmptyArchiveState() {
  return (
    <div className="p-8 text-center">
      <Tags className="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p className="text-gray-500 font-medium">Belum ada arsip rekonsiliasi.</p>
      <p className="text-gray-400 text-sm mt-1">
        Lakukan rekonsiliasi terlebih dahulu dan simpan hasilnya.
      </p>
    </div>
  );
}

interface ArchiveItemProps {
  archive: ReconciliationArchive;
  isExpanded: boolean;
  isClassifying: boolean;
  onToggleExpand: () => void;
  onClassify: () => void;
  formatDate: (dateStr: string) => string;
}

function ArchiveItem({
  archive,
  isExpanded,
  isClassifying,
  onToggleExpand,
  onClassify,
  formatDate,
}: ArchiveItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onToggleExpand} className="p-1 hover:bg-gray-200 rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <div>
            <p className="font-semibold text-gray-800">{archive.nama_arsip}</p>
            <p className="text-xs text-gray-500">
              {archive.user_nama} · {formatDate(archive.created_at)} ·{' '}
              {archive.summary.total_petani} petani
            </p>
          </div>
        </div>
        <button
          onClick={onClassify}
          disabled={isClassifying}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isClassifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Tags className="w-4 h-4" />
          )}
          Klasifikasi
        </button>
      </div>

      {isExpanded && (
        <div className="px-12 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <MiniCard label="Total Petani" value={archive.summary.total_petani} />
            <MiniCard
              label="Tebus Lengkap"
              value={archive.summary.status_penebusan.tebus_lengkap}
            />
            <MiniCard
              label="Tebus Sebagian"
              value={archive.summary.status_penebusan.tebus_sebagian}
            />
            <MiniCard label="Kios Sesuai" value={`${archive.summary.kios.persentase_sesuai}%`} />
          </div>
        </div>
      )}
    </div>
  );
}
