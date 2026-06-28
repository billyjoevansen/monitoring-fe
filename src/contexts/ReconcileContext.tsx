'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ReconcileFileState {
  rdkkFile: File | null;
  sivervalFile: File | null;
}

interface ReconcileContextValue extends ReconcileFileState {
  setRdkkFile: (file: File | null) => void;
  setSivervalFile: (file: File | null) => void;
  resetFiles: () => void;
}

const ReconcileContext = createContext<ReconcileContextValue | null>(null);

export function ReconcileProvider({ children }: { children: ReactNode }) {
  const [rdkkFile, setRdkkFile] = useState<File | null>(null);
  const [sivervalFile, setSivervalFile] = useState<File | null>(null);

  const resetFiles = useCallback(() => {
    setRdkkFile(null);
    setSivervalFile(null);
  }, []);

  return (
    <ReconcileContext.Provider
      value={{ rdkkFile, sivervalFile, setRdkkFile, setSivervalFile, resetFiles }}
    >
      {children}
    </ReconcileContext.Provider>
  );
}

export function useReconcileFiles() {
  const ctx = useContext(ReconcileContext);
  if (!ctx) throw new Error('useReconcileFiles must be used within ReconcileProvider');
  return ctx;
}
