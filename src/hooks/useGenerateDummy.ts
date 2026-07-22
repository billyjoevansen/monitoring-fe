'use client';

import { useState, useCallback } from 'react';
import { generateDummy, type GenerateDummyParams, type GenerateDummyResult } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';

interface SkenarioPct {
  pct_normal: number;
  pct_over: number;
  pct_kurang: number;
}

const ESTIMASI_PETANI: Record<string, number> = {
  'Semua Kecamatan':     9900,
  'Kecamatan Kasemen':   4150,
  'Kecamatan Walantaka': 2275,
  'Kecamatan Taktakan':  1175,
  'Kecamatan Curug':     1075,
  'Kecamatan Cipocok Jaya': 875,
  'Kecamatan Serang':    325,
};

function randomInRange(min: number, max: number): number {
  return Math.round(Math.random() * (max - min) + min);
}

function randomSkenario(normalRange: [number, number], overRange: [number, number]): SkenarioPct {
  const normal = randomInRange(normalRange[0], normalRange[1]);
  const over = randomInRange(overRange[0], Math.min(overRange[1], 100 - normal));
  return {
    pct_normal: normal,
    pct_over: over,
    pct_kurang: 100 - normal - over,
  };
}

function randomNormal(): SkenarioPct {
  return randomSkenario([80, 95], [2, 5]);
}

function randomCampuran(): SkenarioPct {
  return randomSkenario([40, 60], [5, 10]);
}

function randomAnomali(): SkenarioPct {
  return randomSkenario([0, 5], [25, 50]);
}

export function useGenerateDummy() {
  const [nPetani, setNPetani] = useState(350);
  const [nTransaksi, setNTransaksi] = useState(260);
  const [seed, setSeed] = useState<number | ''>('');
  const [kecamatan, setKecamatan] = useState('Semua Kecamatan');
  const [skenario, setSkenario] = useState<SkenarioPct>(randomCampuran);
  const [lastPreset, setLastPreset] = useState<'normal' | 'campuran' | 'anomali' | null>('campuran');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateDummyResult | null>(null);

  const handleKecamatanChange = useCallback((kec: string) => {
    setKecamatan(kec);
    const p = ESTIMASI_PETANI[kec];
    if (p) {
      setNPetani(p);
      setNTransaksi(Math.round(p * (0.5 + Math.random() * 0.49)));
    }
    setLastPreset((prev) => {
      if (prev) {
        switch (prev) {
          case 'normal': setSkenario(randomNormal()); break;
          case 'campuran': setSkenario(randomCampuran()); break;
          case 'anomali': setSkenario(randomAnomali()); break;
        }
      }
      return prev;
    });
  }, []);

  const handleDiscardResult = useCallback(() => setResult(null), []);

  const totalPct =
    skenario.pct_normal + skenario.pct_over + skenario.pct_kurang;

  const applyPreset = useCallback((preset: 'normal' | 'campuran' | 'anomali') => {
    setLastPreset(preset);
    switch (preset) {
      case 'normal': setSkenario(randomNormal()); break;
      case 'campuran': setSkenario(randomCampuran()); break;
      case 'anomali': setSkenario(randomAnomali()); break;
    }
  }, []);

  const updatePct = useCallback((key: keyof SkenarioPct, value: number) => {
    setLastPreset(null);
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
      setError(getApiErrorMessage(err));
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
    lastPreset,
    applyPreset,
    updatePct,
    handleGenerate,
    handleDiscardResult,
    handleKecamatanChange,
  };
}
