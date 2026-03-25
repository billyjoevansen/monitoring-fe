import { Loader2, Save, CheckCircle, Filter } from 'lucide-react';
import DownloadButtons from '@/components/ui/DownloadButtons';
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
}: ReconcileArchiveSectionProps) {
  const isFiltered = searchQuery && searchQuery.trim().length > 0 && filteredDetail;
  const downloadDetail = isFiltered ? filteredDetail : result.detail;

  return (
    <div className="bg-background rounded-xl border border-foreground p-4 shadow-sm mb-6">
      {saved ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Tersimpan ke arsip!</span>
          </div>
          <div className="flex items-center gap-3">
            {isFiltered && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={namaArsip}
            onChange={(e) => onNamaArsipChange(e.target.value)}
            placeholder="Nama arsip (misal: Rekon Kec. Serang Jan 2025)"
            autoComplete="off"
            className="flex-1 px-4 py-2.5 border border-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={saving || !namaArsip.trim()}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan
            </button>
            <div className="flex items-center gap-2">
              {isFiltered && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">
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
