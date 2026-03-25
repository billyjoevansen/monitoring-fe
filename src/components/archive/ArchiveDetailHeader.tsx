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
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {userName} · {formatDate(createdAt)} · {totalPetani} petani
        </p>
      </div>
      <Button onClick={onBack} variant="outline" size="sm">
        ← Kembali
      </Button>
    </div>
  );
}
