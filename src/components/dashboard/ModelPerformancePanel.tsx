import type { ClassificationArchive } from '@/types';

interface ModelPerformancePanelProps {
  modelInfo: NonNullable<ClassificationArchive['model_info']>;
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="flex-1 min-w-[120px]">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs font-bold text-gray-800">{pct}%</p>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function ModelPerformancePanel({ modelInfo }: ModelPerformancePanelProps) {
  return (
    <div className="bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-3">
        Performa Model
      </p>
      <div className="flex flex-wrap gap-4">
        <ProgressBar label="F1-Score" value={modelInfo.f1_score_weighted} color="#6366f1" />
        {modelInfo.oob_score != null && (
          <ProgressBar label="OOB Score" value={modelInfo.oob_score} color="#a78bfa" />
        )}
      </div>
    </div>
  );
}
