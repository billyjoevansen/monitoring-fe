'use client';

import {
  Loader2,
  CheckCircle,
  XCircle,
  FlaskConical,
  Download,
} from 'lucide-react';
import { useGenerateDummy } from '@/hooks/useGenerateDummy';
import { fileSaver } from '@/lib/file-client';
import { KECAMATAN_LIST } from '@/config/kecamatan';

const SKENARIO_LABELS: Record<string, string> = {
  pct_normal: 'Normal',
  pct_over: 'Tebus melebihi kuota',
  pct_kurang: 'Penebusan < 85%',
};

export default function DummyGeneratorSection() {
  const {
    nPetani, setNPetani,
    nTransaksi, setNTransaksi,
    seed, setSeed,
    kecamatan,
    skenario,
    loading, error, result,
    totalPct,
    lastPreset,
    applyPreset,
    updatePct,
    handleGenerate,
    handleDiscardResult,
    handleKecamatanChange,
  } = useGenerateDummy();

  const pctFields = [
    'pct_normal',
    'pct_over',
    'pct_kurang',
  ] as const;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-6 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Generate Data Dummy</h2>
      </div>

      {/* ── Jumlah & Filter ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">
            Jumlah Petani
          </label>
          <input
            type="number"
            min={1}
            value={nPetani}
            onChange={(e) => setNPetani(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">
            Jumlah Transaksi
          </label>
          <input
            type="number"
            min={1}
            value={nTransaksi}
            onChange={(e) => setNTransaksi(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">
            Random Seed
          </label>
          <input
            type="number"
            placeholder="Kosongi untuk acak"
            value={seed}
            onChange={(e) => setSeed(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">
            Kecamatan
          </label>
          <select
            value={kecamatan}
            onChange={(e) => handleKecamatanChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 text-foreground"
          >
            <option>Semua Kecamatan</option>
            {KECAMATAN_LIST.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Preset Skenario ── */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Preset Skenario
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => applyPreset('normal')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${lastPreset === 'normal' ? 'bg-green-200 text-green-800 border-green-500 ring-2 ring-green-500 ring-offset-1' : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'}`}
          >
            Normal
          </button>
          <button
            onClick={() => applyPreset('campuran')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${lastPreset === 'campuran' ? 'bg-blue-200 text-blue-800 border-blue-500 ring-2 ring-blue-500 ring-offset-1' : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'}`}
          >
            Campuran
          </button>
          <button
            onClick={() => applyPreset('anomali')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${lastPreset === 'anomali' ? 'bg-red-200 text-red-800 border-red-500 ring-2 ring-red-500 ring-offset-1' : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'}`}
          >
            Anomali
          </button>
        </div>
      </div>

      {/* ── Proporsi Skenario ── */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-foreground mb-2">
          Proporsi Skenario (%)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {pctFields.map((key) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1">
                {SKENARIO_LABELS[key]}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={skenario[key]}
                  onChange={(e) => updatePct(key, Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-white dark:bg-slate-800 text-foreground text-sm"
                />
                <span className="text-xs text-muted-foreground shrink-0">%</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`mt-2 text-sm font-medium ${Math.abs(totalPct - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
          Total: {totalPct}% {Math.abs(totalPct - 100) < 0.01 ? '✅' : '❌ (harus 100%)'}
        </div>
      </div>



      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-4 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ── Success ── */}
      {result && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">
                Data dummy berhasil dibuat! ({result.summary?.n_transaksi ?? '?'} transaksi dari {result.summary?.n_petani ?? '?'} petani)
              </span>
            </div>
            <button
              onClick={handleDiscardResult}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Tutup
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const blob = new Blob(
                  [Uint8Array.from(atob(result.rdkk.content), (c) => c.charCodeAt(0))],
                  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                );
                fileSaver(blob, result.rdkk.filename);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download RDKK
            </button>
            <button
              onClick={() => {
                const blob = new Blob(
                  [Uint8Array.from(atob(result.siverval.content), (c) => c.charCodeAt(0))],
                  { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                );
                fileSaver(blob, result.siverval.filename);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download Si-Verval
            </button>
          </div>
        </div>
      )}

      {/* ── Tombol Generate ── */}
      <button
        onClick={handleGenerate}
        disabled={loading || Math.abs(totalPct - 100) > 0.01}
        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FlaskConical className="w-4 h-4" />
            Generate Data
          </>
        )}
      </button>
    </div>
  );
}
