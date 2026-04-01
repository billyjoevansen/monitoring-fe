import { SUMMARY_CARD_COLOR_MAP } from '@/config/classifyColumnsConfig';
import type { SummaryCardProps } from '@/types';

export default function SummaryCard({ label, value, color, sub }: SummaryCardProps) {
  return (
    <div className={`p-3 rounded-xl border ${SUMMARY_CARD_COLOR_MAP[color]}`}>
      <p className="text-[10px] font-medium opacity-75 uppercase">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
    </div>
  );
}
