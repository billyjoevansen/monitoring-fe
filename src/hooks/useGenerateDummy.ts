'use client';

import { useState, useCallback } from 'react';
import { generateDummy, type GenerateDummyParams, type GenerateDummyResult } from '@/lib/api';

interface SkenarioPct {
  pct_normal: number;
  pct_over: number;
  pct_luar_rdkk: number;
  pct_kurang: number;
  pct_tanpa_pengajuan: number;
  pct_nonaktif: number;
}

const PRESET_CAMPURAN: SkenarioPct = {
  pct_normal: 35,
  pct_over: 20,
  pct_luar_rdkk: 15,
  pct_kurang: 15,
  pct_tanpa_pengajuan: 10,
  pct_nonaktif: 5,
};

const PRESET_NORMAL: SkenarioPct = {
  pct_normal: 100,
  pct_over: 0,
  pct_luar_rdkk: 0,
  pct_kurang: 0,
  pct_tanpa_pengajuan: 0,
  pct_nonaktif: 0,
};

const PRESET_ANOMALI: SkenarioPct = {
  pct_normal: 0,
  pct_over: 25,
  pct_luar_rdkk: 25,
  pct_kurang: 25,
  pct_tanpa_pengajuan: 15,
  pct_nonaktif: 10,
};

export function useGenerateDummy() {
  const [nPetani, setNPetani] = useState(350);
  const [nTransaksi, setNTransaksi] = useState(260);
  const [seed, setSeed] = useState<number | ''>('');
  const [kecamatan, setKecamatan] = useState('Semua Kecamatan');
  const [skenario, setSkenario] = useState<SkenarioPct>(PRESET_CAMPURAN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateDummyResult | null>(null);

  const handleDiscardResult = useCallback(() => setResult(null), []);

  const totalPct =
    skenario.pct_normal + skenario.pct_over + skenario.pct_luar_rdkk +
    skenario.pct_kurang + skenario.pct_tanpa_pengajuan + skenario.pct_nonaktif;

  const applyPreset = useCallback((preset: 'normal' | 'campuran' | 'anomali') => {
    switch (preset) {
      case 'normal': setSkenario(PRESET_NORMAL); break;
      case 'campuran': setSkenario(PRESET_CAMPURAN); break;
      case 'anomali': setSkenario(PRESET_ANOMALI); break;
    }
  }, []);

  const updatePct = useCallback((key: keyof SkenarioPct, value: number) => {
    setSkenario((prev) => ({ ...prev, [key]: Math.max(0, Math.min(100, value)) }));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (Math.abs(totalPct - 100) > 0.01) {
      setError('Persentase harus berjumlah 100%');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params: GenerateDummyParams = {
        n_petani: nPetani,
        n_transaksi: nTransaksi,
        seed: seed === '' ? null : Number(seed),
        kecamatan: kecamatan === 'Semua Kecamatan' ? null : kecamatan,
        ...skenario,
      };

      const data = await generateDummy(params);
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal generate data dummy.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [nPetani, nTransaksi, seed, kecamatan, skenario, totalPct]);

  return {
    nPetani, setNPetani,
    nTransaksi, setNTransaksi,
    seed, setSeed,
    kecamatan, setKecamatan,
    skenario,
    loading, error, result,
    totalPct,
    applyPreset,
    updatePct,
    handleGenerate,
    handleDiscardResult,
  };
}
