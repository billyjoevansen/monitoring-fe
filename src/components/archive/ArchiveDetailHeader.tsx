import type { ArchiveDetailHeaderProps } from '@/types';
import { Button } from '../ui/button';

export function ArchiveDetailHeader({
  title,
  userName,
  createdAt,
  totalPetani,
  onBack,
  formatDate,
}: ArchiveDetailHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between bg-amber-50 dark:bg-slate-700 p-1 rounded-lg shadow">
      <div className="p-2 ml-3 bg-amber-100 dark:bg-slate-900 outline-1 outline-offset-2 rounded">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <span className="block w-full h-px bg-black dark:bg-white"></span>
        <p className="text-sm text-muted-foreground mt-1">
          {userName} · {formatDate(createdAt)} · {totalPetani} petani
        </p>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="rotate-[-10deg] border-2 border-red-700 px-3 py-1 rounded">
          <span className="text-lg font-black uppercase tracking-widest text-red-500/60 selection:bg-none">
            ARCHIVE
          </span>
        </div>
      </div>
      <Button onClick={onBack} variant="outline" size="sm" className="mr-3">
        ← Kembali
      </Button>
    </div>
  );
}
