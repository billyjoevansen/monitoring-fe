import { BarChart3 } from 'lucide-react';

interface MiniCardProps {
  label: string;
  value: number | string;
}

export default function MiniCard({ label, value }: MiniCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-border/60 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-1.5 mb-1">
        <BarChart3 className="w-3 h-3 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-lg font-bold text-foreground">{String(value)}</p>
    </div>
  );
}
