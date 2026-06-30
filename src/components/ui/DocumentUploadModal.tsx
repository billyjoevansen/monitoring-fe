'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, FileSpreadsheet, Upload, ExternalLink, Loader2, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDocuments } from '@/hooks/useDocuments';
import { identifyKecamatan } from '@/lib/api';

const RDKK_REQUIRED_COLUMNS = ['KTP', 'Nama Petani', 'Luas Lahan (Ha) MT1'];
const SIVERVAL_REQUIRED_COLUMNS = ['NIK', 'NAMA PETANI', 'UREA', 'NPK'];

async function validateExcelColumns(
  file: File,
  type: 'rdkk' | 'siverval',
): Promise<string | null> {
  try {
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    const headerRowIndex = type === 'siverval' ? 1 : 0;
    const headers = (raw[headerRowIndex] ?? []) as string[];

    const required = type === 'rdkk' ? RDKK_REQUIRED_COLUMNS : SIVERVAL_REQUIRED_COLUMNS;
    const missing = required.filter(
      (r) => !headers.some((h) => h?.trim().toLowerCase() === r.toLowerCase()),
    );

    if (missing.length > 0) {
      return `Kolom tidak ditemukan: ${missing.join(', ')}. Pastikan file sesuai format ${type.toUpperCase()}.`;
    }
    return null;
  } catch {
    return 'Gagal membaca file Excel. Pastikan file tidak corrupt.';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentUploadModalProps {
  userId: string;
  onClose: () => void;
}

export default function DocumentUploadModal({ userId, onClose }: DocumentUploadModalProps) {
  const { uploading, error, uploadDocument } = useDocuments(userId);

  const [stagedRdkk, setStagedRdkk] = useState<File | null>(null);
  const [stagedSiverval, setStagedSiverval] = useState<File | null>(null);
  const [rdkkDragging, setRdkkDragging] = useState(false);
  const [sivervalDragging, setSivervalDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [detectedKecamatanRdkk, setDetectedKecamatanRdkk] = useState<string[] | null>(null);
  const [detectedKecamatanSiverval, setDetectedKecamatanSiverval] = useState<string[] | null>(null);
  const [detectingKecamatan, setDetectingKecamatan] = useState(false);
  const rdkkInputRef = useRef<HTMLInputElement>(null);
  const sivervalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const stageFile = useCallback(
    async (file: File, type: 'rdkk' | 'siverval') => {
      setValidationError(null);
      const err = await validateExcelColumns(file, type);
      if (err) {
        setValidationError(err);
        return;
      }
      if (type === 'rdkk') setStagedRdkk(file);
      else setStagedSiverval(file);

      // Auto-detect kecamatan
      setDetectingKecamatan(true);
      try {
        const result = await identifyKecamatan(file, type);
        const kecamatan = result.kecamatan && result.kecamatan.length > 0 ? result.kecamatan : null;
        if (type === 'rdkk') setDetectedKecamatanRdkk(kecamatan);
        else setDetectedKecamatanSiverval(kecamatan);
      } catch {
        if (type === 'rdkk') setDetectedKecamatanRdkk(null);
        else setDetectedKecamatanSiverval(null);
      } finally {
        setDetectingKecamatan(false);
      }
    },
    [],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent, type: 'rdkk' | 'siverval') => {
      e.preventDefault();
      if (type === 'rdkk') setRdkkDragging(false);
      else setSivervalDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        await stageFile(file, type);
      }
    },
    [stageFile],
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, type: 'rdkk' | 'siverval') => {
      const file = e.target.files?.[0];
      if (file) {
        await stageFile(file, type);
        e.target.value = '';
      }
    },
    [stageFile],
  );

  const handleUpload = useCallback(async () => {
    if (!stagedRdkk && !stagedSiverval) return;

    const allKecamatan = [
      ...(detectedKecamatanRdkk || []),
      ...(detectedKecamatanSiverval || []),
    ];
    const mergedKecamatan = allKecamatan.length > 0 ? [...new Set(allKecamatan)] : null;

    let success = true;
    if (stagedRdkk) {
      const result = await uploadDocument(stagedRdkk, 'rdkk', mergedKecamatan);
      if (!result) success = false;
    }
    if (stagedSiverval) {
      const result = await uploadDocument(stagedSiverval, 'siverval', mergedKecamatan);
      if (!result) success = false;
    }

    if (success) {
      setUploadSuccess(true);
      setTimeout(() => onClose(), 1200);
    }
  }, [stagedRdkk, stagedSiverval, detectedKecamatanRdkk, detectedKecamatanSiverval, uploadDocument, onClose]);

  const renderDropzone = (
    type: 'rdkk' | 'siverval',
    dragging: boolean,
    setDragging: (v: boolean) => void,
  ) => {
    const inputRef = type === 'rdkk' ? rdkkInputRef : sivervalInputRef;
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => handleDrop(e, type)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/20'
        }`}
      >
        <Upload
          className={`w-8 h-8 mx-auto mb-2 ${dragging ? 'text-green-500' : 'text-gray-400'}`}
        />
        <p className="text-sm text-foreground font-medium">Drag & drop file di sini</p>
        <p className="text-xs text-muted-foreground mt-1">atau klik untuk pilih (.xlsx)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => handleFileInput(e, type)}
          className="hidden"
        />
      </div>
    );
  };

  const renderStagedFile = (file: File, onRemove: () => void) => (
    <div className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 mt-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <FileSpreadsheet className="w-5 h-5 text-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
        title="Hapus"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );

  const hasStaged = stagedRdkk || stagedSiverval;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl border border-gray-300 dark:border-gray-700 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-foreground">Dokumen Pendukung</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {(error || validationError) && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {validationError || error}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
              Dokumen berhasil diupload!
            </div>
          )}

          {/* RDKK Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Pengajuan RDKK</h3>
            {stagedRdkk ? (
              renderStagedFile(stagedRdkk, () => setStagedRdkk(null))
            ) : (
              renderDropzone('rdkk', rdkkDragging, setRdkkDragging)
            )}
          </div>

          {/* Si-Verval Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Komoditas SIVERVAL</h3>
            {stagedSiverval ? (
              renderStagedFile(stagedSiverval, () => setStagedSiverval(null))
            ) : (
              renderDropzone('siverval', sivervalDragging, setSivervalDragging)
            )}
          </div>

          {/* Kecamatan Detection */}
          {(stagedRdkk || stagedSiverval) && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Kecamatan:</span>
              </div>
              {detectingKecamatan ? (
                <span className="text-sm text-blue-700 dark:text-blue-400 ml-6">Mendeteksi kecamatan...</span>
              ) : (() => {
                const allKecamatan = [
                  ...(detectedKecamatanRdkk || []),
                  ...(detectedKecamatanSiverval || []),
                ];
                const merged = [...new Set(allKecamatan)];
                return merged.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 ml-6">
                    {merged.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                      >
                        <MapPin className="w-3 h-3" />
                        {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-blue-700 dark:text-blue-400 ml-6">Kecamatan tidak terdeteksi dari file</span>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <a
              href="/archives/rdkk"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Dokumen RDKK
            </a>
            <a
              href="/archives/siverval"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Dokumen Si-Verval
            </a>
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!hasStaged || uploading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
