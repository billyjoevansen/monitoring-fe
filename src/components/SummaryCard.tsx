import { SummaryCardProps, SUMMARY_CARD_COLOR_MAP } from '@/types';

/**
 * Komponen kartu ringkasan untuk menampilkan statistik
 * dengan warna yang dapat dikustomisasi
 */
export default function SummaryCard({ label, value, sub, color }: SummaryCardProps) {
  return (
    <div className={`p-4 rounded-xl border ${SUMMARY_CARD_COLOR_MAP[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
    </div>
  );
}
