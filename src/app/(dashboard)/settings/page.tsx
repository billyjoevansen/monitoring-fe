'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  Save,
  RotateCcw,
  CheckCircle,
  Settings,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { getConfig, updateConfig, resetConfig } from '@/lib/api';
import { logActivity } from '@/lib/auth';

interface HyperParams {
  n_estimators: number;
  criterion: string;
  max_depth: number | null;
  max_features: string;
  min_samples_split: number;
  min_samples_leaf: number;
  class_weight: 'balanced' | 'balanced_subsample' | null;
  bootstrap: boolean;
  oob_score: boolean;
  random_state: number;
  n_jobs: number;
}

interface TrainingConfig {
  test_size: number;
  random_state: number;
  stratify: boolean;
}

export default function SettingsPage() {
  const user = useUser();

  const [hp, setHp] = useState<HyperParams | null>(null);
  const [tc, setTc] = useState<TrainingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      setHp(data.config.hyperparameters);
      setTc(data.config.training_config);
    } catch {
      setError('Gagal memuat konfigurasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateConfig({
        hyperparameters: hp,
        training_config: tc,
      });
      await logActivity('update_config', 'Mengubah konfigurasi model');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as {
          response?: {
            data?: { error?: string; details?: string[] };
          };
        };
        setError(
          axiosErr.response?.data?.details?.join(', ') ||
            axiosErr.response?.data?.error ||
            'Gagal menyimpan.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset semua konfigurasi ke default?')) return;
    try {
      const data = await resetConfig();
      setHp(data.config.hyperparameters);
      setTc(data.config.training_config);
      await logActivity('reset_config', 'Reset konfigurasi ke default');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Gagal reset konfigurasi.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!hp || !tc) return null;

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pengaturan Model</h1>
          <p className="text-gray-500 mt-1">Ubah hyperparameter Random Forest</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Konfigurasi berhasil disimpan!
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hyperparameters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Hyperparameter Random Forest</h2>
          <div className="space-y-5">
            <InputField
              label="Jumlah Pohon (n_estimators)"
              desc="10 - 1000"
              type="number"
              value={hp.n_estimators}
              onChange={(v) => setHp({ ...hp, n_estimators: Number(v) })}
            />
            <SelectField
              label="Kriteria (criterion)"
              desc="Metode pengukuran kualitas split"
              value={hp.criterion}
              options={['gini', 'entropy']}
              onChange={(v) => setHp({ ...hp, criterion: v })}
            />
            <InputField
              label="Kedalaman Maks (max_depth)"
              desc="1 - 100 (kosongkan untuk unlimited)"
              type="number"
              value={hp.max_depth ?? ''}
              onChange={(v) => setHp({ ...hp, max_depth: v === '' ? null : Number(v) })}
            />
            <SelectField
              label="Fitur Maks (max_features)"
              desc="Jumlah fitur per split"
              value={hp.max_features}
              options={['sqrt', 'log2', 'auto']}
              onChange={(v) => setHp({ ...hp, max_features: v })}
            />
            <InputField
              label="Min Samples Split"
              desc="2 - 50"
              type="number"
              value={hp.min_samples_split}
              onChange={(v) => setHp({ ...hp, min_samples_split: Number(v) })}
            />
            <InputField
              label="Min Samples Leaf"
              desc="1 - 50"
              type="number"
              value={hp.min_samples_leaf}
              onChange={(v) => setHp({ ...hp, min_samples_leaf: Number(v) })}
            />
            <SelectField
              label="Class Weight"
              desc="Strategi penanganan ketidakseimbangan kelas"
              value={hp.class_weight === null ? 'none' : hp.class_weight}
              options={['none', 'balanced', 'balanced_subsample']}
              onChange={(v) =>
                setHp({
                  ...hp,
                  class_weight: v === 'none' ? null : (v as 'balanced' | 'balanced_subsample'),
                })
              }
            />

            <CheckboxField
              label="Bootstrap Sampling"
              desc="Setiap pohon dilatih dari sampel acak"
              checked={hp.bootstrap}
              onChange={(v) => setHp({ ...hp, bootstrap: v })}
            />
            <CheckboxField
              label="OOB Score"
              desc="Estimasi akurasi tanpa split test"
              checked={hp.oob_score}
              onChange={(v) => setHp({ ...hp, oob_score: v })}
            />
          </div>
        </div>

        {/* Training Config */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Konfigurasi Training</h2>
          <div className="space-y-5">
            <InputField
              label="Test Size"
              desc="0.1 - 0.5"
              type="number"
              step="0.05"
              value={tc.test_size}
              onChange={(v) => setTc({ ...tc, test_size: Number(v) })}
            />
            <InputField
              label="Random State"
              desc="Seed untuk reproducibility"
              type="number"
              value={tc.random_state}
              onChange={(v) => setTc({ ...tc, random_state: Number(v) })}
            />
            <CheckboxField
              label="Stratify Split"
              desc="Mempertahankan proporsi kelas"
              checked={tc.stratify}
              onChange={(v) => setTc({ ...tc, stratify: v })}
            />
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">
              Setelah mengubah pengaturan, lakukan training ulang di halaman Prediksi & Training.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end mt-6">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Default
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Konfigurasi
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  desc,
  type,
  value,
  step,
  onChange,
}: {
  label: string;
  desc: string;
  type: string;
  value: string | number;
  step?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <p className="text-xs text-gray-500 mb-1">{desc}</p>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function SelectField({
  label,
  desc,
  value,
  options,
  onChange,
}: {
  label: string;
  desc: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <p className="text-xs text-gray-500 mb-1">{desc}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
      />
      <div>
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
