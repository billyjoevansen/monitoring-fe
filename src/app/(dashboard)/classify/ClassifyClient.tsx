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
import ResultTable from '@/components/classify/ResultTable';
import ClassifyStatStrip from '@/components/ui/ClassifyStatStrip';
import MiniCard from '@/components/ui/MiniCard';
import ErrorBanner from '@/components/ui/ErrorBanner';
import { useClassify } from '@/hooks/useClassify';
import { CLASSIFY_COLUMNS } from '@/config/classifyColumnsConfig';
import type { ReconciliationArchive, User } from '@/types';
import Hero from '@/components/ui/Hero';

export default function ClassifyClient({ user }: { user: User }) {
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
  } = useClassify(user);

  if (!canClassify) {
    return (
      <div>
        <Hero
          icon={<Tags className="w-10 h-10 text-foreground" />}
          title="Klasifikasi"
          subtitle="Halaman klasifikasi tidak tersedia"
        />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses ke halaman ini.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <Hero
          icon={<Tags className="w-10 h-10 text-foreground" />}
          title="Klasifikasi"
          subtitle="Pilih arsip rekonsiliasi untuk memulai klasifikasi menggunakan model Random Forest"
        />
      )}
      <ErrorBanner message={error} />

      {!result && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-foreground">Pilih Arsip Rekonsiliasi</h2>
            <p className="text-xs text-muted-foreground mt-1">
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

          <ClassifyStatStrip
            total={result.summary.total_petani}
            normal={result.summary.normal}
            tidakNormal={result.summary.tidak_normal}
            persentaseNormal={result.summary.persentase_normal}
            persentaseTidakNormal={result.summary.persentase_tidak_normal}
          />

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-4 shadow-sm mb-6">
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
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
function EmptyArchiveState() {
  return (
    <div className="p-8 text-center">
      <Tags className="w-10 h-10 text-foreground mx-auto mb-2" />
      <p className="text-foreground font-medium">Belum ada arsip rekonsiliasi.</p>
      <p className="text-muted-foreground text-sm mt-1">
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
      <div className="flex items-center justify-between px-4 py-3 hover:bg-foreground/10 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <button onClick={onToggleExpand} className="p-1 hover:bg-foreground/20 rounded">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-foreground" />
            )}
          </button>
          <div>
            <p className="font-semibold text-foreground">{archive.nama_arsip}</p>
            <p className="text-xs text-muted-foreground">
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
              label="Transaksi Lengkap"
              value={archive.summary.status_penebusan.tebus_lengkap}
            />
            <MiniCard
              label="Transaksi Sebagian"
              value={archive.summary.status_penebusan.tebus_sebagian}
            />
          </div>
        </div>
      )}
    </div>
  );
}
