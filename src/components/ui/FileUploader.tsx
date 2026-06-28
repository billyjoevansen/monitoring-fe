'use client';

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface FileUploaderProps {
  label: string;
  description: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileUploader({
  label,
  description,
  file,
  onFileChange,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile &&
        (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))
      ) {
        onFileChange(droppedFile);
      }
    },
    [onFileChange],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const inputId = `file-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById(inputId)?.click()}
          className={`border-2 border-dashed rounded-xl p-8 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
          }`}
        >
          <Upload
            className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-green-500' : 'text-gray-400'}`}
          />
          <p className="text-sm text-foreground font-medium">Drag & drop file di sini</p>
          <p className="text-xs text-muted-foreground mt-1">
            atau klik untuk pilih file (.xlsx / .xls)
          </p>
          <input
            id={inputId}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border-2 border-foreground bg-white dark:bg-slate-900 rounded-xl p-8 min-h-[140px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={() => onFileChange(null)}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}
