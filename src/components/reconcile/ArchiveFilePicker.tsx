'use client';

import { FileSpreadsheet, Database, ArrowRight } from 'lucide-react';
import { formatFileSize } from '@/hooks/useDocuments';
import type { SupportingDocument } from '@/hooks/useDocuments';

interface ArchiveFilePickerProps {
  docs: SupportingDocument[];
  disabled: boolean;
  onSelect: (doc: SupportingDocument) => void;
}

export default function ArchiveFilePicker({ docs, disabled, onSelect }: ArchiveFilePickerProps) {
  if (docs.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="w-3.5 h-3.5" />
        <span>Belum ada arsip</span>
      </div>
    );
  }

  return (
    <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Dokumen</span>
        <span className="text-xs text-muted-foreground">({docs.length})</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-50 overflow-y-auto">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="px-3 py-2 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{doc.file_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatFileSize(doc.file_size)} &middot;{' '}
                  {new Date(doc.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelect(doc)}
              disabled={disabled}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gunakan
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
