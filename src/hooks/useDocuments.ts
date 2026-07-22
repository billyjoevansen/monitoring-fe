'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { logActivityWithUser } from '@/lib/auth-client';
import { identifyKecamatan } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/errors';
import type { User } from '@/types';

export interface SupportingDocument {
  id: string;
  user_id: string;
  document_type: 'rdkk' | 'siverval';
  file_name: string;
  file_path: string;
  file_size: number | null;
  kecamatan: string[] | null;
  total_petani: number;
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

export function useDocuments(
  userId: string | undefined,
  userRole?: string,
  kecamatanFilter?: string,
  userEmail?: string,
  userName?: string,
) {
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
      setError(getApiErrorMessage(err));
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
          .upload(filePath, file, { contentType: file.type, cacheControl: '0' });

        if (uploadErr) throw uploadErr;

        let totalPetani = 0;
        try {
          const kecResult = await identifyKecamatan(file, documentType);
          totalPetani = kecResult.total_petani || 0;
        } catch {
          totalPetani = 0;
        }

        const { error: insertErr } = await supabase.from('supporting_documents').insert({
          user_id: userId,
          document_type: documentType,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          kecamatan: kecamatan && kecamatan.length > 0 ? kecamatan : null,
          total_petani: totalPetani,
        });

        if (insertErr) throw insertErr;

        const typeLabel = documentType === 'rdkk' ? 'RDKK' : 'Si-Verval';
        if (userId && userEmail && userName) {
          logActivityWithUser({ id: userId, email: userEmail, nama: userName, role: (userRole || 'admin') as User['role'] }, 'upload_document', `Upload dokumen ${typeLabel}: ${file.name}`);
        }

        await listDocuments();
        return true;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
        return null;
      } finally {
        setUploading(false);
      }
    },
    [userId, supabase, listDocuments, userEmail, userName, userRole],
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
        if (userId && userEmail && userName) {
          logActivityWithUser({ id: userId, email: userEmail, nama: userName, role: (userRole || 'admin') as User['role'] }, 'delete_document', `Hapus dokumen ${typeLabel}: ${doc.file_name}`);
        }

        await listDocuments();
        return true;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
        return null;
      }
    },
    [supabase, listDocuments, userId, userEmail, userName, userRole],
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
        if (userId && userEmail && userName) {
          logActivityWithUser({ id: userId, email: userEmail, nama: userName, role: (userRole || 'admin') as User['role'] }, 'delete_document', `Hapus ${countLabel}${typeLabel}: ${docs.map((d) => d.file_name).join(', ')}`);
        }

        await listDocuments();
        return true;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
        return null;
      }
    },
    [supabase, listDocuments, userId, userEmail, userName, userRole],
  );

  const downloadDocument = useCallback(
    async (doc: SupportingDocument): Promise<File | null> => {
      setError(null);

      try {
        // Pakai signed URL supaya bypass CDN cache (URL unik tiap request)
        const { data: signedData, error: signErr } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(doc.file_path, 3600);

        if (signErr) throw signErr;

        const response = await fetch(signedData.signedUrl);
        if (!response.ok) throw new Error('Gagal mengunduh file dari storage.');

        const blob = await response.blob();
        return new File([blob], doc.file_name, {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
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
      titleRow?: (string | number)[],
    ): Promise<boolean> => {
      setError(null);

      try {
        // 1. Generate XLSX baru dengan exceljs (font 11)
        const ExcelJS = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Sheet1');

        // SIVERVAL: tambah title row (konsisten dengan file original)
        if (doc.document_type === 'siverval') {
          const titleData = titleRow && titleRow.length > 0 ? titleRow : [];
          ws.addRow(titleData);
          // Merge & center title row across semua kolom (seperti file asli)
          if (titleData.length > 0 || headers.length > 0) {
            const lastCol = String.fromCharCode(64 + headers.length); // A=65 → 'A'
            ws.mergeCells(`A1:${lastCol}1`);
            ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
            ws.getCell('A1').font = { size: 11, bold: true };
          }
        }

        // Header row — font 11 bold
        const headerRow = ws.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.font = { size: 11, bold: true };
        });

        // Data rows — font 11
        rows.forEach((row) => {
          const dataRow = ws.addRow(row);
          dataRow.eachCell((cell) => {
            cell.font = { size: 11 };
          });
        });

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // 2. Upload ke storage (harus selesai dulu)
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(doc.file_path, blob, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true,
            cacheControl: '0',
          });

        if (uploadErr) throw uploadErr;

        // 3. Parallel: update file_size + log (fire-and-forget) + update local state
        const typeLabel = doc.document_type === 'rdkk' ? 'RDKK' : 'Si-Verval';
        await Promise.all([
          supabase
            .from('supporting_documents')
            .update({ file_size: blob.size })
            .eq('id', doc.id),
          userId && userEmail && userName
            ? logActivityWithUser(
                { id: userId, email: userEmail, nama: userName, role: (userRole || 'admin') as User['role'] },
                'edit_document',
                `Edit dokumen ${typeLabel}: ${doc.file_name}`,
              )
            : Promise.resolve(),
        ]);

        // 4. Update local state langsung tanpa re-fetch
        const updater = (prev: SupportingDocument[]) =>
          prev.map((d) => (d.id === doc.id ? { ...d, file_size: blob.size } : d));
        setRdkkDocs(updater);
        setSivervalDocs(updater);

        return true;
      } catch (err: unknown) {
        setError(getApiErrorMessage(err));
        return false;
      }
    },
    [supabase, userId, userEmail, userName, userRole],
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
