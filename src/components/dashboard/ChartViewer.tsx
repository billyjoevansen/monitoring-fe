'use client';

interface ChartViewerProps {
  charts: Record<string, string>;
}

const chartTitles: Record<string, string> = {
  confusion_matrix: 'Confusion Matrix',
  feature_importance: 'Feature Importance',
  classification_report: 'Classification Report',
  label_distribution: 'Distribusi Label',
  reconciliation_summary: 'Ringkasan Rekonsiliasi',
};

export default function ChartViewer({ charts }: ChartViewerProps) {
  if (!charts || Object.keys(charts).length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-foreground mb-4">📊 Visualisasi</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(charts).map(([key, base64]) => (
          <div key={key} className="bg-background rounded-xl border border-gray-200 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              {chartTitles[key] || key}
            </h4>
            <img
              src={`data:image/png;base64,${base64}`}
              alt={chartTitles[key] || key}
              className="w-full rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
