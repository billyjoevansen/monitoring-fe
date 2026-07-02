import { useState } from 'react';
import { hasPermission } from '@/config/rbac';
import { TrainResult, User } from '@/types';
import { trainModel, visualizeTraining } from '@/lib/api';
import { logActivity } from '@/lib/auth-client';
import { getApiErrorMessage } from '@/lib/errors';

export function useTrain(user: User) {
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
      setStep('Hyperparameter tuning dengan 10-Fold CV...');
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
      setError(getApiErrorMessage(err));
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

  return {
    rdkkFile,
    sivervalFile,
    setRdkkFile,
    setSivervalFile,
    loading,
    step,
    trainResult,
    charts,
    error,
    canTrain,
    handleTrain,
    handleReset,
  };
}
