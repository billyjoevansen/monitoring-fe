'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import MiniCard from '@/components/ui/MiniCard';
import type { ReconciliationArchive } from '@/types';
import { formatDate as defaultFormatDate } from '@/lib/format';

interface ReconcilePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  archive: ReconciliationArchive | null;
  formatDate?: (dateStr: string) => string;
}

export default function ReconcilePreviewDialog({
  open,
  onClose,
  archive,
  formatDate = defaultFormatDate,
}: ReconcilePreviewDialogProps) {
  if (!archive) return null;

  const { summary } = archive;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 sm:max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{archive.nama_arsip}</DialogTitle>
          <DialogDescription>
            {archive.user_nama} · {formatDate(archive.created_at)} · {summary.total_petani} petani
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
          <MiniCard label="Total Petani" value={summary.total_petani} />
          <MiniCard
            label="Tebus Lengkap"
            value={summary.status_penebusan.tebus_lengkap}
          />
          <MiniCard
            label="Tebus Sebagian"
            value={summary.status_penebusan.tebus_sebagian}
          />
          <MiniCard
            label="Tebus Melebihi"
            value={summary.status_penebusan.tebus_melebihi}
          />
          <MiniCard
            label="Belum Menebus"
            value={summary.status_penebusan.belum_menebus}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          <ReconcileTable data={archive.detail} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
