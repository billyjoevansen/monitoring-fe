interface ClassifyStatStripProps {
  total: number;
  normal: number;
  tidakNormal: number;
  persentaseNormal: number;
  persentaseTidakNormal: number;
}

export default function ClassifyStatStrip({
  total,
  normal,
  tidakNormal,
  persentaseNormal,
  persentaseTidakNormal,
}: ClassifyStatStripProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-white dark:bg-slate-900 border border-border rounded-lg overflow-hidden text-sm mb-6">
      <div className="flex-1 px-4 py-2.5 text-center sm:border-r border-b sm:border-b-0 border-border">
        <p className="text-[11px] text-muted-foreground">Total Petani</p>
        <p className="text-xl font-bold mt-0.5">{total}</p>
      </div>
      <div className="flex-1 px-4 py-2.5 text-center sm:border-r border-b sm:border-b-0 border-border bg-emerald-50/50 dark:bg-emerald-950/30">
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Normal</p>
        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
          {normal} <span className="text-xs font-normal opacity-70">({persentaseNormal}%)</span>
        </p>
      </div>
      <div className="flex-1 px-4 py-2.5 text-center bg-red-50/50 dark:bg-red-950/30">
        <p className="text-[11px] text-red-700 dark:text-red-400">Tidak Normal</p>
        <p className="text-xl font-bold text-red-700 dark:text-red-400 mt-0.5">
          {tidakNormal}{' '}
          <span className="text-xs font-normal opacity-70">({persentaseTidakNormal}%)</span>
        </p>
      </div>
    </div>
  );
}
