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
import type { User } from '@/types';

interface UserDialogsProps {
  toggleDialogUser: User | null;
  deleteDialogUser: User | null;
  onConfirmToggle: (user: User) => void;
  onConfirmDelete: (user: User) => void;
  onCancelToggle: () => void;
  onCancelDelete: () => void;
}

export function UserDialogs({
  toggleDialogUser,
  deleteDialogUser,
  onConfirmToggle,
  onConfirmDelete,
  onCancelToggle,
  onCancelDelete,
}: UserDialogsProps) {
  const isActive = toggleDialogUser?.is_active;

  return (
    <>
      {/* Dialog Toggle Aktif/Nonaktif */}
      <AlertDialog open={!!toggleDialogUser} onOpenChange={(open) => !open && onCancelToggle()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isActive ? 'Nonaktifkan User?' : 'Aktifkan User?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? `User ${toggleDialogUser?.nama} akan dinonaktifkan dan tidak bisa login. Yakin ingin melanjutkan?`
                : `User ${toggleDialogUser?.nama} akan diaktifkan kembali. Yakin ingin melanjutkan?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => toggleDialogUser && onConfirmToggle(toggleDialogUser)}
              className={
                isActive
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-foreground'
                  : 'bg-green-600 hover:bg-green-700 text-foreground'
              }
            >
              {isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Hapus User */}
      <AlertDialog open={!!deleteDialogUser} onOpenChange={(open) => !open && onCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              User <span className="font-semibold">{deleteDialogUser?.nama}</span> akan dihapus
              permanen dan tidak dapat dikembalikan. Yakin ingin menghapus?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialogUser && onConfirmDelete(deleteDialogUser)}
              className="bg-red-600 hover:bg-red-700 text-foreground"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
