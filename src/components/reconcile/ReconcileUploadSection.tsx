import { Loader2, FileSearch } from 'lucide-react';
import FileUploader from '@/components/ui/FileUploader';
import { Button } from '../ui/button';

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
    <div className="bg-background rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
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
          type="button"
          onClick={onProcess}
          disabled={loading || !rdkkFile || !sivervalFile}
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
          <Button variant="outline" size="xl" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
