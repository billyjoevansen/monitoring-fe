'use client';

import { Loader2, FlaskConical, AlertTriangle, Sparkles } from 'lucide-react';
import { useTrain } from '@/hooks/useTrain';
import FileUploader from '@/components/ui/FileUploader';
import ChartViewer from '@/components/dashboard/ChartViewer';
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
          <h1 className="text-3xl font-bold text-foreground">Training & Testing</h1>
          <p className="text-muted-foreground mt-1">
            Latih model Random Forest dengan data RDKK dan SIVERVAL
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <FileUploader
            label="Data RDKK"
            description="File Excel berisi data pengajuan pupuk petani"
            file={rdkkFile}
            onFileChange={setRdkkFile}
          />
          <FileUploader
            label="Data SIVERVAL"
            description="File Excel berisi data penebusan pupuk petani"
            file={sivervalFile}
            onFileChange={setSivervalFile}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleTrain}
            disabled={loading || !rdkkFile || !sivervalFile}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {step}
              </>
            ) : (
              <>
                <FlaskConical className="w-5 h-5" />
                Mulai Training
              </>
            )}
          </button>
          {trainResult && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      {trainResult && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Hasil Evaluasi Model
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <MetricCard
              label="Akurasi (Train)"
              value={`${((trainResult.model_performance.train?.accuracy ?? trainResult.model_performance.accuracy ?? 0) * 100).toFixed(1)}%`}
            />
            <MetricCard
              label="Akurasi (Test)"
              value={
                trainResult.model_performance.test
                  ? `${(trainResult.model_performance.test.accuracy * 100).toFixed(1)}%`
                  : '-'
              }
            />
            <MetricCard
              label="F1 Score"
              value={`${((trainResult.model_performance.train?.f1_score_weighted ?? trainResult.model_performance.f1_score_weighted ?? 0) * 100).toFixed(1)}%`}
            />
            <MetricCard
              label="OOB Score"
              value={
                trainResult.model_performance.oob_score != null
                  ? `${(trainResult.model_performance.oob_score * 100).toFixed(1)}%`
                  : '-'
              }
            />
            <MetricCard
              label="ROC-AUC"
              value={
                trainResult.model_performance.roc_auc != null
                  ? `${(trainResult.model_performance.roc_auc * 100).toFixed(1)}%`
                  : '-'
              }
            />
          </div>

          {trainResult.model_performance.overfitting_analysis && (
            <div className={`p-4 rounded-lg mb-6 text-sm ${
              trainResult.model_performance.overfitting_analysis.is_overfitting
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <p className="font-semibold">
                {trainResult.model_performance.overfitting_analysis.is_overfitting
                  ? '⚠️ Overfitting Terdeteksi'
                  : '✅ Model Generalizes Well'}
              </p>
              <p>
                Accuracy Gap: {(trainResult.model_performance.overfitting_analysis.accuracy_gap * 100).toFixed(1)}% |
                F1 Gap: {(trainResult.model_performance.overfitting_analysis.f1_gap * 100).toFixed(1)}%
              </p>
              <p>{trainResult.model_performance.overfitting_analysis.keterangan}</p>
            </div>
          )}

          {trainResult.method === 'tuning' && trainResult.tuning && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Hyperparameter Tuning ({trainResult.tuning.n_folds}-Fold Stratified CV)
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <span className="text-xs text-purple-600">Method</span>
                    <p className="font-medium text-purple-700">{trainResult.tuning.method}</p>
                  </div>
                  <div>
                    <span className="text-xs text-purple-600">Total Combinations</span>
                    <p className="font-medium text-purple-700">{trainResult.tuning.total_combinations}</p>
                  </div>
                  <div>
                    <span className="text-xs text-purple-600">Best CV F1</span>
                    <p className="font-medium text-purple-700">
                      {(trainResult.tuning.best_cv_f1 * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-purple-600">Best Params</span>
                    <p className="font-medium text-purple-700 text-xs">
                      {Object.entries(trainResult.tuning.best_params)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {trainResult.tuning.cv_results && trainResult.tuning.cv_results.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-gray-300 rounded-lg p-4 overflow-x-auto mb-4">
                  <h4 className="text-xs font-semibold text-foreground mb-2">
                    Top {Math.min(10, trainResult.tuning.cv_results.length)} dari{' '}
                    {trainResult.tuning.total_combinations} Kombinasi
                  </h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">#</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">n_est.</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">max_depth</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">min_split</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">min_leaf</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">class_wt</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">max_feat</th>
                        <th className="px-2 py-1 text-right font-semibold text-foreground">Mean F1</th>
                        <th className="px-2 py-1 text-right font-semibold text-foreground">Std</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trainResult.tuning.cv_results.slice(0, 10).map((cv) => (
                        <tr
                          key={cv.rank}
                          className={cv.rank === 1 ? 'bg-purple-50' : ''}
                        >
                          <td className="px-2 py-1 text-muted-foreground">{cv.rank}</td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {cv.params.n_estimators as number}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {cv.params.max_depth === null ? 'None' : (cv.params.max_depth as number)}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {cv.params.min_samples_split as number}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {cv.params.min_samples_leaf as number}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {(cv.params.class_weight as string) ?? 'None'}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {cv.params.max_features as string}
                          </td>
                          <td className="px-2 py-1 text-right font-medium text-foreground">
                            {(cv.mean_f1 * 100).toFixed(2)}%
                          </td>
                          <td className="px-2 py-1 text-right text-muted-foreground">
                            ±{(cv.std_f1 * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {trainResult.tuning.cv_results && trainResult.tuning.cv_results.length > 0 && trainResult.tuning.cv_results[0].fold_scores && (
                <div className="bg-white dark:bg-slate-900 border border-gray-300 rounded-lg p-4 overflow-x-auto">
                  <h4 className="text-xs font-semibold text-foreground mb-2">
                    Per-Fold Performance (Kombinasi Terbaik)
                  </h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">Fold</th>
                        <th className="px-2 py-1 text-right font-semibold text-foreground">F1 Score</th>
                        <th className="px-2 py-1 text-right font-semibold text-foreground">vs Mean</th>
                        <th className="px-2 py-1 text-left font-semibold text-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trainResult.tuning.cv_results[0].fold_scores.map((score, idx) => {
                        const mean = trainResult.tuning!.best_cv_f1;
                        const diff = score - mean;
                        const isAbove = diff >= 0;
                        return (
                          <tr key={idx} className={isAbove ? 'bg-green-50' : 'bg-orange-50'}>
                            <td className="px-2 py-1 font-medium text-foreground">Fold {idx + 1}</td>
                            <td className="px-2 py-1 text-right text-muted-foreground">
                              {(score * 100).toFixed(2)}%
                            </td>
                            <td className="px-2 py-1 text-right text-muted-foreground">
                              {isAbove ? '+' : ''}{(diff * 100).toFixed(2)}%
                            </td>
                            <td className="px-2 py-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${isAbove ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {isAbove ? 'Di atas rata-rata' : 'Di bawah rata-rata'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-100 font-bold">
                        <td className="px-2 py-1 text-foreground">Mean</td>
                        <td className="px-2 py-1 text-right text-foreground">
                          {(trainResult.tuning.best_cv_f1 * 100).toFixed(2)}%
                        </td>
                        <td className="px-2 py-1 text-right text-muted-foreground">-</td>
                        <td className="px-2 py-1 text-muted-foreground">
                          Std: ±{(trainResult.tuning.cv_results[0].std_f1 * 100).toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {trainResult.feature_selection && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm mb-6">
              <p className="font-semibold text-purple-700">
                🎯 Feature Selection: {trainResult.feature_selection.total_fitur_terpilih} dari{' '}
                {trainResult.feature_selection.total_fitur_awal} fitur digunakan
              </p>
              {trainResult.feature_selection.fitur_terpilih && (
                <p className="text-purple-600 mt-1">
                  Fitur: {trainResult.feature_selection.fitur_terpilih.join(', ')}
                </p>
              )}
              {trainResult.feature_selection.fitur_dibuang && trainResult.feature_selection.fitur_dibuang.length > 0 && (
                <p className="text-gray-500 mt-1 text-xs">
                  Dibuang: {trainResult.feature_selection.fitur_dibuang.join(', ')}
                </p>
              )}
            </div>
          )}

          {trainResult.method === 'tuning' && trainResult.feature_selection?.feature_frequency && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Feature Frequency (per Fold)</h3>
              <div className="bg-white dark:bg-slate-900 border border-gray-300 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-foreground uppercase">
                        Fitur
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        Frekuensi
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(trainResult.feature_selection.feature_frequency)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feature, count]) => {
                        const threshold = trainResult.feature_selection!.frequency_threshold ?? 0.7;
                        const minCount = Math.ceil(threshold * (trainResult.tuning?.n_folds ?? 10));
                        const passed = count >= minCount;
                        return (
                          <tr key={feature}>
                            <td className="px-4 py-2 font-medium text-foreground font-mono text-xs">
                              {feature}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`font-semibold ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                                {count}/{trainResult.tuning?.n_folds ?? 10}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {passed ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Terpilih
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                  Dibuang
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trainResult.model_performance.classification_report && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Classification Report</h3>
              <div className="bg-white dark:bg-slate-900 border border-gray-300 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-foreground uppercase">
                        Kelas
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        Precision
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        Recall
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        F1-Score
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-semibold text-foreground uppercase">
                        Support
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(
                      trainResult.model_performance.classification_report as unknown as Record<string, { precision: number; recall: number; f1_score: number; support: number }>
                    ).map(
                      ([kelas, metrics]) => (
                        <tr key={kelas}>
                          <td className="px-4 py-2 font-medium text-foreground">{kelas}</td>
                          <td className="px-4 py-2 text-center text-muted-foreground">
                            {(metrics.precision * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-center text-muted-foreground">
                            {(metrics.recall * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-center text-muted-foreground">
                            {(metrics.f1_score * 100).toFixed(1)}%
                          </td>
                          <td className="px-4 py-2 text-center text-muted-foreground">
                            {metrics.support}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trainResult.model_performance.confusion_matrix && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Confusion Matrix</h3>
              <div className="bg-white dark:bg-slate-900 border border-gray-300 rounded-lg p-4 inline-block">
                <table className="text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2" />
                      {trainResult.model_performance.confusion_matrix.labels.map((label) => (
                        <th
                          key={`cm-head-${label}`}
                          className="px-4 py-2 text-center text-xs font-medium text-foreground"
                        >
                          Pred: {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trainResult.model_performance.confusion_matrix.matrix.map((row, i) => (
                      <tr key={`cm-row-${i}`}>
                        <td className="px-4 py-2 text-xs font-medium text-foreground">
                          Act: {trainResult.model_performance.confusion_matrix!.labels[i]}
                        </td>
                        {row.map((val, j) => (
                          <td
                            key={`cm-cell-${i}-${j}`}
                            className={`px-4 py-2 text-center font-bold rounded ${i === j ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {trainResult.model_performance.confusion_matrix.penjelasan && (
                <div className="mt-3 text-xs text-foreground space-y-1">
                  <p>
                    ✅ True Negative (NORMAL → NORMAL):{' '}
                    {trainResult.model_performance.confusion_matrix.penjelasan.true_negative}
                  </p>
                  <p>
                    ⚠️ False Positive (NORMAL → TIDAK NORMAL):{' '}
                    {trainResult.model_performance.confusion_matrix.penjelasan.false_positive}
                  </p>
                  <p>
                    ❌ False Negative (TIDAK NORMAL → NORMAL):{' '}
                    {trainResult.model_performance.confusion_matrix.penjelasan.false_negative}
                  </p>
                  <p>
                    ✅ True Positive (TIDAK NORMAL → TIDAK NORMAL):{' '}
                    {trainResult.model_performance.confusion_matrix.penjelasan.true_positive}
                  </p>
                </div>
              )}
            </div>
          )}

          {trainResult.model_performance.feature_importance && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Feature Importance</h3>
              <div className="space-y-2">
                {Object.entries(trainResult.model_performance.feature_importance).map(
                  ([feature, importance]) => (
                    <div key={feature} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-48 truncate" title={feature}>
                        {feature}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{ width: `${(importance * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-14 text-right">
                        {(importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  ),
                )}
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
    <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
      <p className="text-xs text-foreground font-medium">{label}</p>
      <p className="text-xl font-bold text-muted-foreground mt-1">{value}</p>
    </div>
  );
}
