import { useEffect, useState, useCallback } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth-client';
import { formatDate } from '@/lib/format';
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

  const [search, setSearch] = useState('');
  const [filterWilayah, setFilterWilayah] = useState('');

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const [viewingArchive, setViewingArchive] = useState<T | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadArchives = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = manageClient();

      let query = supabase
        .from(table)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // role filter
      if (filterByKecamatan) {
        query = query.eq('kecamatan', filterByKecamatan);
      }

      // search
      if (search) {
        query = query.or(`nama_arsip.ilike.%${search}%,user_nama.ilike.%${search}%`);
      }

      // filter wilayah
      if (filterWilayah) {
        query = query.eq('kecamatan', filterWilayah);
      }

      // pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setArchives((data as T[]) ?? []);
      setTotal(count ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch error');
      setArchives([]);
    } finally {
      setLoading(false);
    }
  }, [table, search, filterWilayah, page, filterByKecamatan]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  useEffect(() => {
    setPage(1);
  }, [search, filterWilayah]);

  const totalPages = Math.ceil(total / pageSize);

  // 🔥 tetap return API lama
  return {
    archives,
    filtered: archives, // sekarang sudah difilter dari server
    loading,
    error,

    search,
    setSearch,

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
    handleDelete: async (archive: T) => {
      if (!confirm(`Hapus "${archive.nama_arsip}"?`)) return;

      setDeleting(archive.id);

      const supabase = manageClient();
      const { error } = await supabase.from(table).delete().eq('id', archive.id);

      if (!error) {
        await logActivity(deleteActivityKey, deleteActivityLabel(archive));
        setArchives((prev) => prev.filter((a) => a.id !== archive.id));
      }

      setDeleting(null);
    },

    formatDate,

    selectedIds,
    allSelected: archives.length > 0 && archives.every((a) => selectedIds.has(a.id)),

    bulkDeleting,

    toggleSelectArchive: (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },

    toggleSelectAll: () => {
      setSelectedIds(new Set(archives.map((a) => a.id)));
    },

    handleBulkDelete: async () => {
      if (selectedIds.size === 0) return;

      setBulkDeleting(true);

      const ids = Array.from(selectedIds);
      const supabase = manageClient();

      await supabase.from(table).delete().in('id', ids);

      setArchives((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());

      setBulkDeleting(false);
    },
  };
}
