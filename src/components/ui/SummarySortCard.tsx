'use client';

import { ArrowUp } from 'lucide-react';
import { SUMMARY_CARD_DOT_COLOR } from '@/config/classifyColumnsConfig';
import type { SummaryCardColor } from '@/types';

interface SummarySortCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color: SummaryCardColor;
  active: boolean;
  onClick: () => void;
}

const ACTIVE_BG: Record<SummaryCardColor, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm',
  green: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-sm',
  yellow: 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm',
  red: 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 shadow-sm',
  orange: 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700 shadow-sm',
  purple: 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 shadow-sm',
};

export default function SummarySortCard({
  label,
  value,
  sub,
  color,
  active,
  onClick,
}: SummarySortCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer hover:shadow-md ${
        active
          ? ACTIVE_BG[color]
          : 'bg-white dark:bg-slate-900 border-border/60 hover:border-border hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full shrink-0 ${SUMMARY_CARD_DOT_COLOR[color]}`} />
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        {active && <ArrowUp className="w-3 h-3 ml-auto text-muted-foreground shrink-0" />}
      </div>
      <p className="text-xl font-bold mt-1">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </button>
  );
}
