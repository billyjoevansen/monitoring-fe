'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  Plus,
  AlertTriangle,
  FileUp,
  Eye,
  ArrowLeft,
  Save,
  Loader2,
  Search,
  MapPin,
  CheckSquare,
  Square,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import Hero from '@/components/ui/Hero';
import DocumentDataTable from '@/components/ui/DocumentDataTable';
import type { ColumnGroup } from '@/components/ui/DocumentDataTable';
import DocumentRowEditorModal from '@/components/ui/DocumentRowEditorModal';
import { useDocuments, formatFileSize } from '@/hooks/useDocuments';
import type { SupportingDocument } from '@/hooks/useDocuments';
import type { Role } from '@/types';
import { KECAMATAN_LIST } from '@/config/kecamatan';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import * as XLSX from 'xlsx';

const RDKK_GROUPS: ColumnGroup[] = [
  {
    label: 'Identitas',
    columns: [
      { key: 'Nama Penyuluh', label: 'Penyuluh' },
      { key: 'Kode Desa', label: 'Kode Desa' },
      { key: 'Kode Kios Pengecer', label: 'Kode Kios' },
      { key: 'Nama Kios Pengecer', label: 'Nama Kios' },
      { key: 'Gapoktan', label: 'Gapoktan' },
      { key: 'Nama Poktan', label: 'Poktan' },
      { key: 'Nama Petani', label: 'Nama Petani' },
      { key: 'KTP', label: 'NIK' },
      { key: 'Tempat Lahir', label: 'Tempat Lahir' },
      { key: 'Tanggal Lahir', label: 'Tgl Lahir' },
      { key: 'Nama Ibu Kandung', label: 'Ibu Kandung' },
      { key: 'Alamat', label: 'Alamat' },
      { key: 'Subsektor', label: 'Subsektor' },
    ],
  },
  {
    label: 'MT1',
    columns: [
      { key: 'Komoditas MT1', label: 'Komoditas' },
      { key: 'Luas Lahan (Ha) MT1', label: 'Luas (Ha)' },
      { key: 'Pupuk Urea (Kg) MT1', label: 'Urea' },
      { key: 'Pupuk NPK (Kg) MT1', label: 'NPK' },
      { key: 'Pupuk NPK Formula (Kg) MT1', label: 'NPK Formula' },
      { key: 'Pupuk Organik (Kg) MT1', label: 'Organik' },
      { key: 'Pupuk ZA (Kg) MT1', label: 'ZA' },
    ],
  },
  {
    label: 'MT2',
    columns: [
      { key: 'Komoditas MT2', label: 'Komoditas' },
      { key: 'Luas Lahan (Ha) MT2', label: 'Luas (Ha)' },
      { key: 'Pupuk Urea (Kg) MT2', label: 'Urea' },
      { key: 'Pupuk NPK (Kg) MT2', label: 'NPK' },
      { key: 'Pupuk NPK Formula (Kg) MT2', label: 'NPK Formula' },
      { key: 'Pupuk Organik (Kg) MT2', label: 'Organik' },
      { key: 'Pupuk ZA (Kg) MT2', label: 'ZA' },
    ],
  },
  {
    label: 'MT3',
    columns: [
      { key: 'Komoditas MT3', label: 'Komoditas' },
      { key: 'Luas Lahan (Ha) MT3', label: 'Luas (Ha)' },
      { key: 'Pupuk Urea (Kg) MT3', label: 'Urea' },
      { key: 'Pupuk NPK (Kg) MT3', label: 'NPK' },
      { key: 'Pupuk NPK Formula (Kg) MT3', label: 'NPK Formula' },
      { key: 'Pupuk Organik (Kg) MT3', label: 'Organik' },
      { key: 'Pupuk ZA (Kg) MT3', label: 'ZA' },
    ],
  },
];

interface RdkkArchivesClientProps {
  userId: string;
  canAccess: boolean;
  userRole: Role;
  userKecamatan: string | null;
  userEmail: string;
  userName: string;
}

export default function RdkkArchivesClient({
  userId,
  canAccess,
  userRole,
  userKecamatan,
  userEmail,
  userName,
}: RdkkArchivesClientProps) {
  const router = useRouter();
  const isBpp = userRole === 'bpp';
  const bppKecamatan = isBpp && userKecamatan ? userKecamatan : undefined;
  const { rdkkDocs, loading, error, deleteDocument, deleteDocuments, downloadDocument, updateDocument, refresh } =
    useDocuments(userId, userRole, bppKecamatan, userEmail, userName);

  const [deleteTarget, setDeleteTarget] = useState<SupportingDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<SupportingDocument[] | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const effectiveFilter = isBpp ? (userKecamatan || '') : filterKecamatan;

  const filteredDocs = rdkkDocs.filter((d) => {
    const matchSearch = searchQuery.trim()
      ? d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    // kecamatan is now an array - check if it contains the filter value
    const matchKecamatan = effectiveFilter
      ? d.kecamatan?.some(k => k.toLowerCase() === effectiveFilter.toLowerCase()) ?? false
      : true;
    return matchSearch && matchKecamatan;
  });

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const allFilteredSelected = filteredDocs.length > 0 && filteredDocs.every((d) => selectedIds.has(d.id));

  const toggleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDocs.map((d) => d.id)));
    }
  }, [allFilteredSelected, filteredDocs]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // View state
  const [viewingDoc, setViewingDoc] = useState<SupportingDocument | null>(null);
  const [tableData, setTableData] = useState<Record<string, string | number>[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Row editor modal state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<Record<string, string | number> | null>(null);

  // Refs for handleSave — assigned during render (no useEffect needed)
  const viewingDocRef = useRef(viewingDoc);
  viewingDocRef.current = viewingDoc;
  const tableDataRef = useRef(tableData);
  tableDataRef.current = tableData;

  const initialTableDataRef = useRef<Record<string, string | number>[]>([]);

  const hasChanges = useMemo(
    () => JSON.stringify(tableData) !== JSON.stringify(initialTableDataRef.current),
    [tableData],
  );

  const handleDownload = useCallback(
    async (doc: (typeof rdkkDocs)[0]) => {
      const file = await downloadDocument(doc);
      if (!file) return;
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    },
    [downloadDocument],
  );

  const handleUse = useCallback(
    async (doc: (typeof rdkkDocs)[0]) => {
      router.push(`/reconcile?doc_id=${doc.id}&type=rdkk`);
    },
    [router],
  );

  const handleView = useCallback(
    async (doc: (typeof rdkkDocs)[0]) => {
      setLoadingDoc(true);
      setViewingDoc(doc);
      try {
        const file = await downloadDocument(doc);
        if (!file) return;
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });
        const headers = (raw[0] ?? []).map(String);
        const rows = raw
          .slice(1)
          .filter((row) => row.some((cell) => cell !== null && cell !== ''))
          .map((row) => {
            const obj: Record<string, string | number> = {};
            headers.forEach((h, i) => {
              obj[h] = row[i] ?? '';
            });
            return obj;
          });
        setTableData(rows);
        initialTableDataRef.current = rows;
      } catch {
        setTableData([]);
      } finally {
        setLoadingDoc(false);
      }
    },
    [downloadDocument],
  );

  const handleSave = async () => {
    if (!viewingDocRef.current) return;
    setSaving(true);
    try {
      const allCols = RDKK_GROUPS.flatMap((g) => g.columns.map((c) => c.key));
      const excelData = tableDataRef.current.map((row) => allCols.map((key) => row[key] ?? ''));

      const success = await updateDocument(viewingDocRef.current, allCols, excelData);
      if (success) {
        showToast('success', 'Berhasil menyimpan perubahan dokumen.');
        refresh();
        handleBack();
      } else {
        showToast('error', 'Gagal menyimpan dokumen.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = useCallback(() => {
    setViewingDoc(null);
    setTableData([]);
    initialTableDataRef.current = [];
    setEditingRowIndex(null);
    setEditingRowData(null);
  }, []);

  const handleEditRow = useCallback((rowIndex: number) => {
    setEditingRowIndex(rowIndex);
    setEditingRowData({ ...tableData[rowIndex] });
  }, [tableData]);

  const handleRowEditSave = useCallback((updatedRow: Record<string, string | number>) => {
    if (editingRowIndex === null) return;
    setTableData((prev) =>
      prev.map((row, ri) => (ri === editingRowIndex ? updatedRow : row)),
    );
    setEditingRowIndex(null);
    setEditingRowData(null);
  }, [editingRowIndex]);

  const handleRowEditCancel = useCallback(() => {
    setEditingRowIndex(null);
    setEditingRowData(null);
  }, []);

  const handleAddRow = useCallback(() => {
    const allCols = RDKK_GROUPS.flatMap((g) => g.columns.map((c) => c.key));
    const emptyRow: Record<string, string | number> = {};
    allCols.forEach((key) => { emptyRow[key] = ''; });
    setTableData((prev) => [...prev, emptyRow]);
  }, []);

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setTableData((prev) => prev.filter((_, i) => i !== rowIndex));
  }, []);

  if (!canAccess) {
    return (
      <div>
        <Hero
          icon={<FileUp className="w-8 h-8 text-foreground" />}
          title="Akses Ditolak"
          subtitle="Anda tidak memiliki izin untuk mengakses halaman ini."
        />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk melihat dokumen.</span>
        </div>
      </div>
    );
  }

  // View mode
  if (viewingDoc) {
    return (
      <div>
        <Hero
          icon={<FileSpreadsheet className="w-8 h-8 text-foreground" />}
          title={viewingDoc.file_name}
          subtitle="Pratinjau isi dokumen — klik Edit pada baris untuk mengubah data"
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <button
            type="button"
            onClick={() => handleDownload(viewingDoc)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          {hasChanges && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan
            </button>
          )}
        </div>

        <DocumentDataTable
          groups={RDKK_GROUPS}
          data={tableData}
          editable={false}
          onEditRow={handleEditRow}
          onAddRow={handleAddRow}
          onDeleteRow={handleDeleteRow}
          loading={loadingDoc}
        />

        <DocumentRowEditorModal
          key={editingRowData ? `row-${editingRowIndex}` : 'closed'}
          open={editingRowIndex !== null}
          groups={RDKK_GROUPS}
          rowData={editingRowData}
          onSave={handleRowEditSave}
          onCancel={handleRowEditCancel}
          saving={saving}
        />
      </div>
    );
  }

  // List mode
  return (
    <div>
      <Hero
        icon={<FileSpreadsheet className="w-8 h-8 text-foreground" />}
        title="Dokumen RDKK"
        subtitle="Dokumen pengajuan RDKK yang sudah di-upload"
        actions={
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-12 text-center">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Memuat dokumen...</p>
        </div>
      ) : rdkkDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 p-12 text-center">
          <FileUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Belum ada dokumen RDKK</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload dokumen melalui tombol dokumen di kanan bawah layar.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {isBpp ? (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-slate-800 border border-gray-300 rounded-lg text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{userKecamatan || '—'}</span>
              </div>
            ) : (
              <select
                value={filterKecamatan}
                onChange={(e) => setFilterKecamatan(e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Semua Kecamatan</option>
                {KECAMATAN_LIST.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            )}
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  const targets = filteredDocs.filter((d) => selectedIds.has(d.id));
                  setBulkDeleteTarget(targets);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Hapus {selectedIds.size} Dokumen
              </button>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
                    <th className="w-10 px-4 py-3">
                      <button type="button" onClick={toggleSelectAll} className="flex items-center justify-center">
                        {allFilteredSelected ? (
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Nama File</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Ukuran</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Tanggal Upload
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">
                      Kecamatan
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        Tidak ada file yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className={`border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${
                          selectedIds.has(doc.id)
                            ? 'bg-green-50 dark:bg-green-900/10'
                            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => toggleSelect(doc.id)} className="flex items-center justify-center">
                            {selectedIds.has(doc.id) ? (
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <FileSpreadsheet className="w-5 h-5 text-green-600 shrink-0" />
                            <span className="font-medium text-foreground truncate">
                              {doc.file_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {doc.kecamatan && doc.kecamatan.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {doc.kecamatan.map((k) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"
                            >
                              <MapPin className="w-3 h-3" />
                              {k}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleView(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUse(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Gunakan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
            <AlertDialogDescription>
              File &quot;{deleteTarget?.file_name}&quot; akan dihapus permanen dari dokumen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (deleteTarget) {
                  const result = await deleteDocument(deleteTarget);
                  setDeleteTarget(null);
                  if (result) {
                    showToast('success', `Berhasil menghapus dokumen ${deleteTarget.file_name}.`);
                  } else {
                    showToast('error', 'Gagal menghapus dokumen.');
                  }
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!bulkDeleteTarget} onOpenChange={(open) => !open && setBulkDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen Terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkDeleteTarget?.length} dokumen akan dihapus permanen dari dokumen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (bulkDeleteTarget && bulkDeleteTarget.length > 0) {
                  const count = bulkDeleteTarget.length;
                  const result = await deleteDocuments(bulkDeleteTarget);
                  setBulkDeleteTarget(null);
                  setSelectedIds(new Set());
                  if (result) {
                    showToast('success', `Berhasil menghapus ${count} dokumen.`);
                  } else {
                    showToast('error', 'Gagal menghapus dokumen.');
                  }
                }
              }}
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {toast && (
        <div className="fixed top-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-top-2 fade-in">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${
              toast.type === 'success'
                ? 'border-black dark:border-green-800 bg-green-200 dark:bg-white'
                : 'border-black dark:border-red-800 bg-red-200 dark:bg-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
            )}
            <div className="flex-1 text-sm">
              <p className={`font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {toast.type === 'success' ? 'Berhasil' : 'Gagal'}
              </p>
              <p className={toast.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={dismissToast}
              className="mt-2 px-1.5 text-gray-400 hover:text-gray-600 border-2 rounded-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
