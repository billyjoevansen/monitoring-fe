import type { ArchiveDetailHeaderProps } from '@/types';

export function ArchiveDetailHeader({
  title,
  userName,
  createdAt,
  totalPetani,
  onBack,
  backButtonColor = 'bg-gray-100',
  formatDate,
}: ArchiveDetailHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {userName} · {formatDate(createdAt)} · {totalPetani} petani
        </p>
      </div>
      <button
        onClick={onBack}
        className={`px-4 py-2 ${backButtonColor} text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm`}
      >
        ← Kembali
      </button>
    </div>
  );
}
