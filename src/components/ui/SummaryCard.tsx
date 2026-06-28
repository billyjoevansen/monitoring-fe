import { SUMMARY_CARD_DOT_COLOR } from '@/config/classifyColumnsConfig';
import type { SummaryCardProps } from '@/types';

export default function SummaryCard({ label, value, color, sub }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-border rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SUMMARY_CARD_DOT_COLOR[color]}`} />
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
      </div>
      <p className="text-xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
