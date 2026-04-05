import type { ClassificationArchive } from '@/types';

interface ModelPerformancePanelProps {
  modelInfo: NonNullable<ClassificationArchive['model_info']>;
}

export default function ModelPerformancePanel({ modelInfo }: ModelPerformancePanelProps) {
  const metrics = [
    { label: 'Akurasi', value: `${(modelInfo.accuracy * 100).toFixed(2)}%` },
    { label: 'F1-Score', value: `${(modelInfo.f1_score_weighted * 100).toFixed(2)}%` },
    ...(modelInfo.oob_score != null
      ? [{ label: 'OOB Score', value: `${(modelInfo.oob_score * 100).toFixed(2)}%` }]
      : []),
  ];

  return (
    <div className="bg-linear-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
        Performa Model
      </p>
      <div className="flex flex-wrap gap-4">
        {metrics.map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
