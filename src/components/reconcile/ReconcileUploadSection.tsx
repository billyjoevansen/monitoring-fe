import { Loader2, FileSearch } from 'lucide-react';
import FileUploader from '@/components/FileUploader';

interface ReconcileUploadSectionProps {
  rdkkFile: File | null;
  sivervalFile: File | null;
  loading: boolean;
  hasResult: boolean;
  onRdkkChange: (file: File | null) => void;
  onSivervalChange: (file: File | null) => void;
  onProcess: () => void;
  onReset: () => void;
}

export default function ReconcileUploadSection({
  rdkkFile,
  sivervalFile,
  loading,
  hasResult,
  onRdkkChange,
  onSivervalChange,
  onProcess,
  onReset,
}: ReconcileUploadSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
      <div className="flex gap-6">
        <FileUploader
          label="Data RDKK"
          description="File Excel data pengajuan pupuk"
          file={rdkkFile}
          onFileChange={onRdkkChange}
        />
        <FileUploader
          label="Data SIVERVAL"
          description="File Excel data penebusan pupuk"
          file={sivervalFile}
          onFileChange={onSivervalChange}
        />
      </div>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onProcess}
          disabled={loading || !rdkkFile || !sivervalFile}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
