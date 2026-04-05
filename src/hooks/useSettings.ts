import { useState, useEffect } from 'react';
import { getConfig, updateConfig, resetConfig } from '@/lib/api';
import { logActivity } from '@/lib/auth-client';
import type { HyperParams, TrainingConfig } from '../types';

interface UseSettingsReturn {
  hp: HyperParams | null;
  tc: TrainingConfig | null;
  fetchLoading: boolean;
  fetchError: string | null;
  saving: boolean;
  success: boolean;
  error: string | null;
  setHp: React.Dispatch<React.SetStateAction<HyperParams | null>>;
  setTc: React.Dispatch<React.SetStateAction<TrainingConfig | null>>;
  handleSave: () => Promise<void>;
  handleReset: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [hp, setHp] = useState<HyperParams | null>(null);
  const [tc, setTc] = useState<TrainingConfig | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConfig()
      .then((data) => {
        setHp(data.config.hyperparameters);
        setTc(data.config.training_config);
      })
      .catch(() => setFetchError('Gagal memuat konfigurasi.'))
      .finally(() => setFetchLoading(false));
  }, []);

  const showSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateConfig({ hyperparameters: hp, training_config: tc });
      await logActivity('update_config', 'Mengubah konfigurasi model');
      showSuccess();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; details?: string[] } } };
        setError(
          axiosErr.response?.data?.details?.join(', ') ||
            axiosErr.response?.data?.error ||
            'Gagal menyimpan.',
        );
      } else {
        setError('Gagal menyimpan.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset semua konfigurasi ke default?')) return;
    try {
      setError(null);
      const data = await resetConfig();
      setHp(data.config.hyperparameters);
      setTc(data.config.training_config);
      await logActivity('reset_config', 'Reset konfigurasi ke default');
      showSuccess();
    } catch {
      setError('Gagal reset konfigurasi.');
    }
  };

  return {
    hp,
    tc,
    fetchLoading,
    fetchError,
    saving,
    success,
    error,
    setHp,
    setTc,
    handleSave,
    handleReset,
  };
}
