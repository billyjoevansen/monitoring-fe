'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth-client';

export interface SupportingDocument {
  id: string;
  user_id: string;
  document_type: 'rdkk' | 'siverval';
  file_name: string;
  file_path: string;
  file_size: number | null;
  kecamatan: string[] | null;
  created_at: string;
}

const BUCKET = 'documents';

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { formatFileSize };

export function useDocuments(userId: string | undefined, userRole?: string, kecamatanFilter?: string) {
  const [rdkkDocs, setRdkkDocs] = useState<SupportingDocument[]>([]);
  const [sivervalDocs, setSivervalDocs] = useState<SupportingDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => manageClient(), []);

  const listDocuments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('supporting_documents')
        .select('*');

      if (kecamatanFilter) {
        // BPP: lihat semua dokumen yang mengandung kecamatan mereka
        query = query.contains('kecamatan', [kecamatanFilter]);
      } else if (['admin', 'kabid', 'kasie'].includes(userRole || '')) {
        // Admin/Kabid/Kasie: lihat semua dokumen (tanpa filter)
      } else {
        // Default: hanya dokumen sendiri
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchErr } = await query
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const rdkk = (data || []).filter((d) => d.document_type === 'rdkk');
      const siverval = (data || []).filter((d) => d.document_type === 'siverval');
      setRdkkDocs(rdkk);
      setSivervalDocs(siverval);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat dokumen.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, kecamatanFilter, userRole]);

  useEffect(() => {
    listDocuments();
  }, [listDocuments]);

  const uploadDocument = useCallback(
    async (file: File, documentType: 'rdkk' | 'siverval', kecamatan?: string[] | null) => {
      if (!userId) return null;
      setUploading(true);
      setError(null);

      try {
        const filePath = `${userId}/${Date.now()}_${file.name}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(filePath, file, { contentType: file.type });

        if (uploadErr) throw uploadErr;

        const { error: insertErr } = await supabase.from('supporting_documents').insert({
          user_id: userId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          kecamatan: kecamatan && kecamatan.length > 0 ? kecamatan : null,
        });

        if (insertErr) throw insertErr;

        const typeLabel = documentType === 'rdkk' ? 'RDKK' : 'Si-Verval';
        await logActivity('upload_document', `Upload dokumen ${typeLabel}: ${file.name}`);

        await listDocuments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal mengupload dokumen.';
        setError(message);
        return null;
      } finally {
        setUploading(false);
      }
    },
    [userId, supabase, listDocuments],
  );

  const deleteDocument = useCallback(
    async (doc: SupportingDocument) => {
      setError(null);

      try {
        const { error: storageErr } = await supabase.storage.from(BUCKET).remove([doc.file_path]);
        if (storageErr) throw storageErr;

        const { error: dbErr } = await supabase
          .from('supporting_documents')
          .delete()
          .eq('id', doc.id);
        if (dbErr) throw dbErr;

        const typeLabel = doc.document_type === 'rdkk' ? 'RDKK' : 'Si-Verval';
        await logActivity('delete_document', `Hapus dokumen ${typeLabel}: ${doc.file_name}`);

        await listDocuments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal menghapus dokumen.';
        setError(message);
        return null;
      }
    },
    [supabase, listDocuments],
  );

  const deleteDocuments = useCallback(
    async (docs: SupportingDocument[]) => {
      setError(null);

      try {
        const filePaths = docs.map((d) => d.file_path);
        const { error: storageErr } = await supabase.storage.from(BUCKET).remove(filePaths);
        if (storageErr) throw storageErr;

        const ids = docs.map((d) => d.id);
        const { error: dbErr } = await supabase
          .from('supporting_documents')
          .delete()
          .in('id', ids);
        if (dbErr) throw dbErr;

        const typeLabel = docs.length === 1
          ? (docs[0].document_type === 'rdkk' ? 'RDKK' : 'Si-Verval')
          : 'dokumen';
        const countLabel = docs.length > 1 ? `${docs.length} ` : '';
        await logActivity('delete_document', `Hapus ${countLabel}${typeLabel}: ${docs.map((d) => d.file_name).join(', ')}`);

        await listDocuments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal menghapus dokumen.';
        setError(message);
        return null;
      }
    },
    [supabase, listDocuments],
  );

  const downloadDocument = useCallback(
    async (doc: SupportingDocument): Promise<File | null> => {
      setError(null);

      try {
        const { data, error: downloadErr } = await supabase.storage
          .from(BUCKET)
          .download(doc.file_path);

        if (downloadErr) throw downloadErr;

        return new File([data], doc.file_name, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal mengunduh dokumen.';
        setError(message);
        return null;
      }
    },
    [supabase],
  );

  const getFileUrl = useCallback(
    (doc: SupportingDocument): string => {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(doc.file_path);
      return data.publicUrl;
    },
    [supabase],
  );

  const updateDocument = useCallback(
    async (
      doc: SupportingDocument,
      headers: string[],
      rows: (string | number)[][],
    ): Promise<boolean> => {
      setError(null);

      try {
        const XLSX = await import('xlsx');
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(doc.file_path, blob, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true,
          });

        if (uploadErr) throw uploadErr;

        const { error: updateErr } = await supabase
          .from('supporting_documents')
          .update({ file_size: blob.size })
          .eq('id', doc.id);

        if (updateErr) throw updateErr;

        const typeLabel = doc.document_type === 'rdkk' ? 'RDKK' : 'Si-Verval';
        await logActivity('edit_document', `Edit dokumen ${typeLabel}: ${doc.file_name}`);

        await listDocuments();
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal menyimpan dokumen.';
        setError(message);
        return false;
      }
    },
    [supabase, listDocuments],
  );

  return {
    rdkkDocs,
    sivervalDocs,
    loading,
    uploading,
    error,
    uploadDocument,
    deleteDocument,
    deleteDocuments,
    downloadDocument,
    getFileUrl,
    updateDocument,
    refresh: listDocuments,
  };
}
