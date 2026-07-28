import { Loader2, FileSearch } from 'lucide-react';
import FileUploader from '@/components/ui/FileUploader';
import ArchiveFilePicker from '@/components/reconcile/ArchiveFilePicker';
import { Button } from '../ui/button';
import type { SupportingDocument } from '@/hooks/useDocuments';

interface ReconcileUploadSectionProps {
  rdkkFile: File | null;
  sivervalFile: File | null;
  loading: boolean;
  hasResult: boolean;
  rdkkDocs: SupportingDocument[];
  sivervalDocs: SupportingDocument[];
  onRdkkChange: (file: File | null) => void;
  onSivervalChange: (file: File | null) => void;
  onRdkkArchiveSelect: (doc: SupportingDocument) => void;
  onSivervalArchiveSelect: (doc: SupportingDocument) => void;
  onProcess: () => void;
  onReset: () => void;
}

export default function ReconcileUploadSection({
  rdkkFile,
  sivervalFile,
  loading,
  hasResult,
  rdkkDocs,
  sivervalDocs,
  onRdkkChange,
  onSivervalChange,
  onRdkkArchiveSelect,
  onSivervalArchiveSelect,
  onProcess,
  onReset,
}: ReconcileUploadSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex-1">
          <FileUploader
            label="Data RDKK"
            description="File Excel data pengajuan pupuk"
            file={rdkkFile}
            onFileChange={onRdkkChange}
          />
          {(!hasResult || !rdkkFile) && (
            <ArchiveFilePicker
              docs={rdkkDocs}
              disabled={!!rdkkFile}
              onSelect={onRdkkArchiveSelect}
            />
          )}
        </div>
        <div className="flex-1">
          <FileUploader
            label="Data SIVERVAL"
            description="File Excel data penebusan pupuk"
            file={sivervalFile}
            onFileChange={onSivervalChange}
          />
          {(!hasResult || !sivervalFile) && (
            <ArchiveFilePicker
              docs={sivervalDocs}
              disabled={!!sivervalFile}
              onSelect={onSivervalArchiveSelect}
            />
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onProcess}
          disabled={loading || !rdkkFile || !sivervalFile || hasResult}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <FileSearch className="w-5 h-5" />
              Mulai Rekonsiliasi
            </>
          )}
        </button>
        {hasResult && (
          <Button variant="outline" size="lg" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
