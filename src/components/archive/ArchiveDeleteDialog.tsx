import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { BaseArchive, BaseSummary } from '@/types';

interface ArchiveDeleteDialogProps<T extends BaseArchive<BaseSummary>> {
  open: boolean;
  isBulkDelete: boolean;
  archiveToDelete: T | null;
  bulkDeleteCount: number;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ArchiveDeleteDialog<T extends BaseArchive<BaseSummary>>({
  open,
  isBulkDelete,
  archiveToDelete,
  bulkDeleteCount,
  deleting,
  onConfirm,
  onCancel,
}: ArchiveDeleteDialogProps<T>) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulkDelete ? `Hapus ${bulkDeleteCount} Arsip?` : 'Hapus Arsip?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {isBulkDelete
                  ? `${bulkDeleteCount} arsip yang dipilih akan dihapus secara permanen.`
                  : 'Arsip berikut akan dihapus secara permanen.'}
              </p>

              {/* Detail card — hanya untuk single delete */}
              {!isBulkDelete && archiveToDelete && (
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p>
                    <span className="font-medium text-foreground">Nama Arsip:</span>{' '}
                    {archiveToDelete.nama_arsip}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Dibuat oleh:</span>{' '}
                    {archiveToDelete.user_nama}
                  </p>
                </div>
              )}

              <p className="text-red-600 text-sm font-medium">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {isBulkDelete ? `Hapus ${bulkDeleteCount} Arsip` : 'Ya, Hapus'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
