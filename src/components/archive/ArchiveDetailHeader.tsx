import { FolderArchive } from 'lucide-react';
import type { ArchiveDetailHeaderProps } from '@/types';

export function ArchiveDetailHeader({
  title,
  userName,
  createdAt,
  totalPetani,
  onBack,
  formatDate,
  backButtonColor,
}: ArchiveDetailHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl shadow-lg border border-gray-200 dark:border-slate-700/50">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-white dark:bg-slate-800" />
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
          color: 'inherit',
        }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700/70 border border-gray-200 dark:border-slate-600/30">
            <FolderArchive className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
            <p className="text-sm text-gray-800 dark:text-slate-200 mt-0.5">
              {userName} · {formatDate(createdAt)} · {totalPetani} petani
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border select-none bg-emerald-50 text-emerald-600 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)] dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/50 dark:shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            ARCHIVE
          </span>
          <button
            onClick={onBack}
            className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors
              border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:text-gray-900
              dark:border-slate-300 dark:text-slate-100 dark:bg-transparent dark:hover:bg-slate-700 dark:hover:text-white
              ${backButtonColor ?? ''}`}
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
