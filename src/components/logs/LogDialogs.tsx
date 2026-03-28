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
import { ACTION_LABELS } from '@/config/logConfig';
import { formatDate, formatTime } from '@/components/logs/logUtils';
import type { ActivityLog } from '@/types';

interface LogDialogsProps {
  open: boolean;
  isBulkDelete: boolean;
  logToDelete: ActivityLog | null;
  bulkDeleteCount: number;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogDialogs({
  open,
  isBulkDelete,
  logToDelete,
  bulkDeleteCount,
  deleting,
  onConfirm,
  onCancel,
}: LogDialogsProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBulkDelete ? `Hapus ${bulkDeleteCount} Log?` : 'Hapus Log?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {isBulkDelete
                  ? `${bulkDeleteCount} log yang dipilih akan dihapus secara permanen.`
                  : 'Log berikut akan dihapus secara permanen.'}
              </p>

              {/* Detail card for single delete */}
              {!isBulkDelete && logToDelete && (
                <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                  <p>
                    <span className="font-medium text-foreground">User:</span>{' '}
                    {logToDelete.user_nama}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Aktivitas:</span>{' '}
                    {ACTION_LABELS[logToDelete.action]?.label || logToDelete.action}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Waktu:</span>{' '}
                    {formatDate(logToDelete.created_at)} {formatTime(logToDelete.created_at)}
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
                {isBulkDelete ? `Hapus ${bulkDeleteCount} Log` : 'Ya, Hapus'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
