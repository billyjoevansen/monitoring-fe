import { useEffect, useState, useCallback } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth-client';
import { formatDate } from '@/lib/format';
import { decryptNikArray } from '@/lib/api';

import type { BaseArchive, BaseSummary, UseArchiveOptions } from '@/types';

export function useArchive<T extends BaseArchive<BaseSummary>>({
  table,
  deleteActivityKey,
  deleteActivityLabel,
  filterByKecamatan,
}: UseArchiveOptions<T>) {
  const [archives, setArchives] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // input realtime
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [filterWilayah, setFilterWilayah] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [viewingArchive, setViewingArchive] = useState<T | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<T | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const submitSearch = useCallback(() => {
    setAppliedSearch(search.trim());
    setPage(1);
  }, [search]);

  const loadArchives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = manageClient();

      let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Gunakan filterWilayah dari dropdown jika ada, jika tidak pakai filterByKecamatan dari prop
      const effectiveKecamatan = filterWilayah || filterByKecamatan;
      if (effectiveKecamatan) {
        query = query.eq('kecamatan', effectiveKecamatan);
      }

      // hanya pakai keyword yang sudah di-submit (Enter)
      if (appliedSearch.length >= 2) {
        query = query.or(`nama_arsip.ilike.%${appliedSearch}%,user_nama.ilike.%${appliedSearch}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      // DECRYPT NIK VIA BACKEND AFTER LOADING
      const decryptedData =
        data?.map(async (archive) => {
          try {
            const decrypted = await decryptNikArray(archive.detail);
            return { ...archive, detail: decrypted };
          } catch {
            return archive;
          }
        }) ?? [];

      const resolvedData = await Promise.all(decryptedData);
      setArchives((resolvedData as T[]) ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch error');
      setArchives([]);
    } finally {
      setLoading(false);
    }
  }, [table, appliedSearch, filterWilayah, page, filterByKecamatan]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  useEffect(() => {
    setPage(1);
  }, [filterWilayah]);

  const totalPages = Math.ceil(total / pageSize);

  const handleDelete = (archive: T) => {
    setArchiveToDelete(archive);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!archiveToDelete) return;

    setDeleting(archiveToDelete.id);

    const supabase = manageClient();
    const { error } = await supabase.from(table).delete().eq('id', archiveToDelete.id);

    if (error) {
      setError('Gagal menghapus arsip. Silakan coba lagi.');
      setDeleting(null);
      setDeleteDialogOpen(false);
      setArchiveToDelete(null);
      return;
    }

    await logActivity(deleteActivityKey, deleteActivityLabel(archiveToDelete));
    setArchives((prev) => prev.filter((a) => a.id !== archiveToDelete.id));

    setDeleting(null);
    setDeleteDialogOpen(false);
    setArchiveToDelete(null);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setArchiveToDelete(null);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setBulkDeleting(true);

    const ids = Array.from(selectedIds);
    const supabase = manageClient();

    const { error } = await supabase.from(table).delete().in('id', ids);

    if (error) {
      setError('Gagal menghapus arsip secara massal. Silakan coba lagi.');
      setBulkDeleting(false);
      setBulkDeleteDialogOpen(false);
      return;
    }

    await logActivity('bulk_delete_archive', `Menghapus ${ids.length} arsip secara massal`);
    setArchives((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    setSelectedIds(new Set());

    setBulkDeleting(false);
    setBulkDeleteDialogOpen(false);
  };

  const cancelBulkDelete = () => {
    if (bulkDeleting) return;
    setBulkDeleteDialogOpen(false);
  };

  return {
    archives,
    filtered: archives,
    loading,
    error,

    search,
    setSearch,
    submitSearch,

    filterWilayah,
    setFilterWilayah,

    page,
    setPage,
    totalPages,

    viewingArchive,
    setViewingArchive,

    expandedId,
    toggleExpand: (id: string) => setExpandedId((prev) => (prev === id ? null : id)),

    deleting,
    handleDelete,
    confirmDelete,
    cancelDelete,
    deleteDialogOpen,
    archiveToDelete,

    formatDate,

    selectedIds,
    allSelected: archives.length > 0 && archives.every((a) => selectedIds.has(a.id)),

    bulkDeleting,
    handleBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete,
    bulkDeleteDialogOpen,

    toggleSelectArchive: (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    },

    toggleSelectAll: () => {
      setSelectedIds((prev) => {
        if (prev.size === archives.length) {
          return new Set();
        }
        return new Set(archives.map((a) => a.id));
      });
    },
  };
}
