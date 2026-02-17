'use client';

import { useState } from 'react';
import { Loader2, FlaskConical, AlertTriangle, Sparkles, XCircle } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { trainModel, visualizeTraining } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import FileUploader from '@/components/FileUploader';
import ChartViewer from '@/components/ChartViewer';
import type { TrainResult } from '@/types';

export default function TrainingPage() {
  const user = useUser();
  const canTrain = hasPermission(user.role, 'train_model');

  const [rdkkFile, setRdkkFile] = useState<File | null>(null);
  const [sivervalFile, setSivervalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [trainResult, setTrainResult] = useState<TrainResult | null>(null);
  const [charts, setCharts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async () => {
    if (!rdkkFile || !sivervalFile) {
      setError('Upload kedua file terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setTrainResult(null);
    setCharts({});

    try {
      setStep('Melatih model Random Forest...');
      const data = await trainModel(rdkkFile, sivervalFile);
      setTrainResult(data as TrainResult);
      await logActivity('train_model', 'Training model selesai');

      setStep('Membuat visualisasi...');
      try {
        const vizData = await visualizeTraining(data);
        setCharts(vizData.charts || {});
      } catch (err) {
        console.warn('Visualisasi gagal bukan error fatal', err);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Terjadi kesalahan.');
      } else {
        setError('Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  const handleReset = () => {
    setTrainResult(null);
    setCharts({});
    setRdkkFile(null);
    setSivervalFile(null);
    setError(null);
  };

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
          <p className="text-gray-500 mt-1">
            Latih model Random Forest dengan data RDKK dan SIVERVAL
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex gap-6">
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Training Result */}
      {trainResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Hasil Evaluasi Model
          </h2>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <MetricCard
              label="Accuracy"
              value={`${(trainResult.model_performance.accuracy * 100).toFixed(1)}%`}
            />
            <MetricCard
              label="F1 Score"
              value={`${(trainResult.model_performance.f1_score_weighted * 100).toFixed(1)}%`}
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
              label="Model Size"
              value={trainResult.model_file?.size_kb ? `${trainResult.model_file.size_kb} KB` : '-'}
            />
          </div>

          {/* Feature Selection */}
          {trainResult.feature_selection && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm mb-6">
              <p className="font-semibold text-purple-700">
                🎯 Feature Selection: {trainResult.feature_selection.total_fitur_terpilih} dari{' '}
                {trainResult.feature_selection.total_fitur_awal} fitur digunakan
              </p>
            </div>
          )}

          {/* Classification Report */}
          {trainResult.model_performance.classification_report && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Classification Report</h3>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre">
                {trainResult.model_performance.classification_report}
              </pre>
            </div>
          )}

          {/* Confusion Matrix */}
          {trainResult.model_performance.confusion_matrix && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Confusion Matrix</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                <table className="text-sm">
                  <thead>
                    <tr>
                      <th className="px-4 py-2" />
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                        Pred: Normal
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                        Pred: Tidak Normal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainResult.model_performance.confusion_matrix.map((row, i) => (
                      <tr key={`cm-row-${i}`}>
                        <td className="px-4 py-2 text-xs font-medium text-gray-500">
                          {i === 0 ? 'Act: Normal' : 'Act: Tidak Normal'}
                        </td>
                        {row.map((val, j) => (
                          <td
                            key={`cm-cell-${i}-${j}`}
                            className={`px-4 py-2 text-center font-bold rounded ${
                              i === j ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
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
