'use client';

import { Loader2, FlaskConical, AlertTriangle, Sparkles } from 'lucide-react';
import { useTrain } from '@/hooks/useTrain';
import FileUploader from '@/components/ui/FileUploader';
import ChartViewer from '@/components/ui/ChartViewer';
import ErrorBanner from '@/components/ui/ErrorBanner';
import type { User } from '@/types';

export default function TrainingClient({ user }: { user: User }) {
  const {
    rdkkFile,
    sivervalFile,
    loading,
    step,
    trainResult,
    charts,
    error,
    canTrain,
    handleTrain,
    handleReset,
    setSivervalFile,
    setRdkkFile,
  } = useTrain(user);

  if (!canTrain) {
    return (
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Training & Testing</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk training model.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Training & Testing</h1>
          <p className="text-gray-500 mt-1">Latih model Random Forest dengan data RDKK dan SIVERVAL</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex gap-6">
          <FileUploader label="Data RDKK" description="File Excel berisi data pengajuan pupuk petani" file={rdkkFile} onFileChange={setRdkkFile} />
          <FileUploader label="Data SIVERVAL" description="File Excel berisi data penebusan pupuk petani" file={sivervalFile} onFileChange={setSivervalFile} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleTrain} disabled={loading || !rdkkFile || !sivervalFile} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{step}</>
            ) : (
              <><FlaskConical className="w-5 h-5" />Mulai Training</>
            )}
          </button>
          {trainResult && (
            <button onClick={handleReset} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
              Reset
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {trainResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Hasil Evaluasi Model
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard label="Accuracy" value={`${(trainResult.model_performance.accuracy * 100).toFixed(1)}%`} />
            <MetricCard label="F1 Score" value={`${(trainResult.model_performance.f1_score_weighted * 100).toFixed(1)}%`} />
            <MetricCard label="OOB Score" value={trainResult.model_performance.oob_score != null ? `${(trainResult.model_performance.oob_score * 100).toFixed(1)}%` : '-'} />
            <MetricCard label="Model Size" value={trainResult.model_file?.size_kb ? `${trainResult.model_file.size_kb} KB` : '-'} />
          </div>

          {trainResult.feature_selection && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm mb-6">
              <p className="font-semibold text-purple-700">
                🎯 Feature Selection: {trainResult.feature_selection.total_fitur_terpilih} dari{' '}
                {trainResult.feature_selection.total_fitur_awal} fitur digunakan
              </p>
              {trainResult.feature_selection.fitur_terpilih && (
                <p className="text-purple-600 mt-1">Fitur: {trainResult.feature_selection.fitur_terpilih.join(', ')}</p>
              )}
            </div>
          )}

          {trainResult.model_performance.classification_report && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Classification Report</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Kelas</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Precision</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Recall</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">F1-Score</th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase">Support</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(trainResult.model_performance.classification_report).map(([kelas, metrics]) => (
                      <tr key={kelas}>
                        <td className="px-4 py-2 font-medium text-gray-800">{kelas}</td>
                        <td className="px-4 py-2 text-center text-gray-700">{(metrics.precision * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-center text-gray-700">{(metrics.recall * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-center text-gray-700">{(metrics.f1_score * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 text-center text-gray-700">{metrics.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trainResult.model_performance.confusion_matrix && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Confusion Matrix</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                <table className="text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2" />
                      {trainResult.model_performance.confusion_matrix.labels.map((label) => (
                        <th key={`cm-head-${label}`} className="px-4 py-2 text-center text-xs font-medium text-gray-500">Pred: {label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trainResult.model_performance.confusion_matrix.matrix.map((row, i) => (
                      <tr key={`cm-row-${i}`}>
                        <td className="px-4 py-2 text-xs font-medium text-gray-500">Act: {trainResult.model_performance.confusion_matrix!.labels[i]}</td>
                        {row.map((val, j) => (
                          <td key={`cm-cell-${i}-${j}`} className={`px-4 py-2 text-center font-bold rounded ${i === j ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {trainResult.model_performance.confusion_matrix.penjelasan && (
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <p>✅ True Negative (NORMAL → NORMAL): {trainResult.model_performance.confusion_matrix.penjelasan.true_negative}</p>
                  <p>⚠️ False Positive (NORMAL → TIDAK NORMAL): {trainResult.model_performance.confusion_matrix.penjelasan.false_positive}</p>
                  <p>❌ False Negative (TIDAK NORMAL → NORMAL): {trainResult.model_performance.confusion_matrix.penjelasan.false_negative}</p>
                  <p>✅ True Positive (TIDAK NORMAL → TIDAK NORMAL): {trainResult.model_performance.confusion_matrix.penjelasan.true_positive}</p>
                </div>
              )}
            </div>
          )}

          {trainResult.model_performance.feature_importance && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Feature Importance</h3>
              <div className="space-y-2">
                {Object.entries(trainResult.model_performance.feature_importance).map(([feature, importance]) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-48 truncate" title={feature}>{feature}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${(importance * 100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-14 text-right">{(importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ChartViewer charts={charts} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
