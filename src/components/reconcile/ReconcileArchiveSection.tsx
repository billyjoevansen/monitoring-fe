import { Loader2, Save, CheckCircle, Filter, MapPin } from 'lucide-react';
import DownloadButtons from '@/components/ui/DownloadButtons';
import { KECAMATAN_LIST } from '@/config/kecamatan';
import { ReconcileArchiveSectionProps } from '@/types';

export default function ReconcileArchiveSection({
  result,
  namaArsip,
  saving,
  saved,
  onNamaArsipChange,
  onSave,
  filteredDetail,
  searchQuery,
  kecamatan,
  onKecamatanChange,
  userKecamatan,
}: ReconcileArchiveSectionProps) {
  const isFiltered = searchQuery && searchQuery.trim().length > 0 && filteredDetail;
  const downloadDetail = isFiltered ? filteredDetail : result.detail;

  // BPP: kecamatan dikunci sesuai wilayah user
  const isBpp = userKecamatan !== null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-foreground p-4 shadow-sm mb-6">
      {saved ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Tersimpan ke arsip!</span>
            </div>
            {kecamatan && (
              <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5" />
                <span>{kecamatan}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isFiltered && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/40 px-2.5 py-1.5 rounded-lg">
                <Filter className="w-3.5 h-3.5" />
                <span>
                  Download {filteredDetail.length} dari {result.detail.length} data
                  {searchQuery ? ` (filter: "${searchQuery}")` : ''}
                </span>
              </div>
            )}
            <DownloadButtons detail={downloadDetail} summary={result.summary} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Row 1: Nama arsip + Kecamatan */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Nama arsip */}
            <input
              type="text"
              value={namaArsip}
              onChange={(e) => onNamaArsipChange(e.target.value)}
              placeholder="Nama arsip (misal: Rekon Kec. Serang Jan 2025)"
              autoComplete="off"
              className="flex-1 px-4 py-2.5 border border-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Kecamatan selector */}
            <div className="relative sm:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              {isBpp ? (
                /* BPP: tampilkan kecamatannya, tidak bisa diubah */
                <div className="w-full pl-9 pr-4 py-2.5 border border-foreground rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-foreground select-none cursor-not-allowed">
                  {kecamatan || (
                    <span className="text-muted-foreground">Kecamatan tidak diatur</span>
                  )}
                </div>
              ) : (
                /* Admin / kabid / kasie: tidak terbatas wilayah */
                <select
                  value={kecamatan}
                  onChange={(e) => onKecamatanChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-background appearance-none cursor-pointer"
                >
                  <option value="">— Pilih kecamatan —</option>
                  {KECAMATAN_LIST.map((kec) => (
                    <option key={kec} value={kec}>
                      {kec}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Row 2: Simpan + Download */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onSave}
              disabled={saving || !namaArsip.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan ke Arsip
            </button>

            <div className="flex items-center gap-2">
              {isFiltered && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/40 px-2.5 py-1.5 rounded-lg">
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {filteredDetail.length}/{result.detail.length}
                  </span>
                </div>
              )}
              <DownloadButtons detail={downloadDetail} summary={result.summary} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
