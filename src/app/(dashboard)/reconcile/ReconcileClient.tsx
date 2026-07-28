'use client';

import { FileSearch, AlertTriangle } from 'lucide-react';
import { hasPermission } from '@/config/rbac';
import { useReconcile } from '@/hooks/useReconcile';
import { useDocuments } from '@/hooks/useDocuments';
import { useReconcileFiles } from '@/contexts/ReconcileContext';
import ReconcileUploadSection from '@/components/reconcile/ReconcileUploadSection';
import ReconcileArchiveSection from '@/components/reconcile/ReconcileArchiveSection';
import SummarySortCard from '@/components/ui/SummarySortCard';
import ReconcileTable from '@/components/reconcile/ReconcileTable';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import ErrorBanner from '@/components/ui/ErrorBanner';
import type { User } from '@/types';
import type { SupportingDocument } from '@/hooks/useDocuments';
import Hero from '@/components/ui/Hero';
import { useEffect, useRef, useState, useCallback } from 'react';

interface ReconcileClientProps {
  user: User;
  initialDocId?: string | null;
  initialDocType?: string | null;
}

export default function ReconcileClient({
  user,
  initialDocId,
  initialDocType,
}: ReconcileClientProps) {
  const canUpload = hasPermission(user.role, 'upload_files');
  const bppKecamatan = user.role === 'bpp' ? (user.kecamatan ?? undefined) : undefined;
  const { downloadDocument, rdkkDocs, sivervalDocs } = useDocuments(
    user.id,
    user.role,
    bppKecamatan,
  );
  const ctx = useReconcileFiles();

  const [loadingDoc, setLoadingDoc] = useState(false);

  const setRdkkFileRef = useRef(ctx.setRdkkFile);
  const setSivervalFileRef = useRef(ctx.setSivervalFile);

  useEffect(() => {
    setRdkkFileRef.current = ctx.setRdkkFile;
    setSivervalFileRef.current = ctx.setSivervalFile;
  });

  const handleRdkkArchiveSelect = useCallback(
    async (doc: SupportingDocument) => {
      setLoadingDoc(true);
      const file = await downloadDocument(doc);
      if (file) {
        ctx.setRdkkFile(file);
      }
      setLoadingDoc(false);
    },
    [downloadDocument, ctx],
  );

  const handleSivervalArchiveSelect = useCallback(
    async (doc: SupportingDocument) => {
      setLoadingDoc(true);
      const file = await downloadDocument(doc);
      if (file) {
        ctx.setSivervalFile(file);
      }
      setLoadingDoc(false);
    },
    [downloadDocument, ctx],
  );

  const {
    loading,
    result,
    error,
    namaArsip,
    setNamaArsip,
    kecamatan,
    setKecamatan,
    saving,
    saved,
    handleProcess,
    handleSaveToArchive,
    handleReset,
    filteredDetail,
    searchQuery,
    handleFilteredDataChange,
  } = useReconcile(user, {
    rdkkFile: ctx.rdkkFile,
    sivervalFile: ctx.sivervalFile,
    onRdkkChange: ctx.setRdkkFile,
    onSivervalChange: ctx.setSivervalFile,
  });

  useEffect(() => {
    if (!initialDocId || !initialDocType) return;

    const loadDoc = async () => {
      setLoadingDoc(true);
      const allDocs = initialDocType === 'rdkk' ? rdkkDocs : sivervalDocs;
      const doc = allDocs.find((d) => d.id === initialDocId);
      if (doc) {
        const file = await downloadDocument(doc);
        if (file) {
          if (initialDocType === 'rdkk') {
            setRdkkFileRef.current(file);
          } else {
            setSivervalFileRef.current(file);
          }
          window.history.replaceState(null, '', '/reconcile');
        }
      } else {
        window.history.replaceState(null, '', '/reconcile');
      }
      setLoadingDoc(false);
    };

    if (rdkkDocs.length > 0 || sivervalDocs.length > 0) {
      loadDoc();
    }
  }, [initialDocId, initialDocType, rdkkDocs, sivervalDocs, downloadDocument]);

  const [noMatchDismissed, setNoMatchDismissed] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);

  if (!canUpload) {
    return (
      <div>
        <Hero
          icon={<FileSearch className="w-8 h-8 text-foreground" />}
          title="Akses Ditolak"
          subtitle="Anda tidak memiliki izin untuk mengakses halaman ini."
        />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk upload file.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!result && (
        <Hero
          icon={<FileSearch className="w-8 h-8 text-foreground" />}
          title="Rekonsiliasi"
          subtitle="Pencocokan data RDKK dengan SIVERVAL"
        />
      )}

      {loadingDoc && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Memuat dokumen dari arsip...
        </div>
      )}

      <ReconcileUploadSection
        rdkkFile={ctx.rdkkFile}
        sivervalFile={ctx.sivervalFile}
        loading={loading}
        hasResult={!!result}
        rdkkDocs={rdkkDocs}
        sivervalDocs={sivervalDocs}
        onRdkkChange={ctx.setRdkkFile}
        onSivervalChange={ctx.setSivervalFile}
        onRdkkArchiveSelect={handleRdkkArchiveSelect}
        onSivervalArchiveSelect={handleSivervalArchiveSelect}
        onProcess={handleProcess}
        onReset={() => {
          handleReset();
          setSortKey(null);
        }}
      />

      <ErrorBanner message={error} />

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <SummarySortCard
              label="Total Petani"
              value={result.summary.total_petani}
              color="blue"
              active={sortKey === null}
              onClick={() => setSortKey(null)}
            />
            <SummarySortCard
              label="Transaksi Lengkap"
              value={result.summary.status_penebusan.tebus_lengkap}
              color="green"
              active={sortKey === 'tebus_lengkap'}
              onClick={() => setSortKey(sortKey === 'tebus_lengkap' ? null : 'tebus_lengkap')}
            />
            <SummarySortCard
              label="Transaksi Sebagian"
              value={result.summary.status_penebusan.tebus_sebagian}
              color="yellow"
              active={sortKey === 'tebus_sebagian'}
              onClick={() => setSortKey(sortKey === 'tebus_sebagian' ? null : 'tebus_sebagian')}
            />
            <SummarySortCard
              label="Transaksi Berlebih"
              value={result.summary.status_penebusan.tebus_melebihi}
              color="red"
              active={sortKey === 'tebus_melebihi'}
              onClick={() => setSortKey(sortKey === 'tebus_melebihi' ? null : 'tebus_melebihi')}
            />
            <SummarySortCard
              label="Belum Transaksi"
              value={result.summary.status_penebusan.belum_menebus}
              color="orange"
              active={sortKey === 'belum_menebus'}
              onClick={() => setSortKey(sortKey === 'belum_menebus' ? null : 'belum_menebus')}
            />
          </div>

          <ReconcileArchiveSection
            result={result}
            namaArsip={namaArsip}
            saving={saving}
            saved={saved}
            onNamaArsipChange={setNamaArsip}
            onSave={handleSaveToArchive}
            filteredDetail={filteredDetail}
            searchQuery={searchQuery}
            kecamatan={kecamatan}
            onKecamatanChange={setKecamatan}
            userKecamatan={user.role === 'bpp' ? (user.kecamatan ?? null) : null}
          />

          <ReconcileTable
            key={sortKey ?? 'default'}
            data={result.detail}
            onFilteredDataChange={handleFilteredDataChange}
            sortKey={sortKey}
          />
        </>
      )}

      <AlertDialog
        open={!noMatchDismissed && (result?.warnings?.length ?? 0) > 0}
        onOpenChange={(open) => {
          if (!open) setNoMatchDismissed(true);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-yellow-500" />
            </AlertDialogMedia>
            <AlertDialogTitle>Tidak Ada Kecocokan NIK</AlertDialogTitle>
            <AlertDialogDescription>
              {result?.warnings?.[0] ??
                'Tidak ditemukan kecocokan NIK antara data RDKK dan Si-Verval.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              type="button"
              onClick={() => setNoMatchDismissed(true)}
              className={cn(buttonVariants({ variant: 'default', size: 'default' }))}
            >
              Mengerti
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
