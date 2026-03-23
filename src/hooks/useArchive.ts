import { useEffect, useState, useCallback } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import type { BaseArchive, BaseSummary, UseArchiveOptions } from '@/types';

export function useArchive<T extends BaseArchive<BaseSummary>>({
  table,
  deleteActivityKey,
  deleteActivityLabel,
}: UseArchiveOptions<T>) {
  const [archives, setArchives] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewingArchive, setViewingArchive] = useState<T | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadArchives = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = manageClient();
    const { data, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setArchives(data as T[]);
    }
    setLoading(false);
  }, [table]);

  useEffect(() => {
    loadArchives();
  }, [loadArchives]);

  const handleDelete = async (archive: T) => {
    if (!confirm(`Hapus arsip "${archive.nama_arsip}"? Tindakan ini tidak dapat dibatalkan.`))
      return;

    setDeleting(archive.id);
    const supabase = manageClient();
    const { error: deleteError } = await supabase.from(table).delete().eq('id', archive.id);

    if (!deleteError) {
      await logActivity(deleteActivityKey, deleteActivityLabel(archive));
      setArchives((prev) => prev.filter((a) => a.id !== archive.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(archive.id);
        return next;
      });
      if (viewingArchive?.id === archive.id) setViewingArchive(null);
    }

    setDeleting(null);
  };

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const filtered = archives.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.nama_arsip.toLowerCase().includes(q) || a.user_nama.toLowerCase().includes(q);
  });

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));

  const toggleSelectArchive = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Hapus ${selectedIds.size} arsip sekaligus? Tindakan ini tidak dapat dibatalkan.`))
      return;

    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const supabase = manageClient();

    const { error: deleteError } = await supabase.from(table).delete().in('id', ids);

    if (!deleteError) {
      await logActivity(deleteActivityKey, `Bulk delete ${ids.length} arsip`);
      const deleted = new Set(selectedIds);
      setArchives((prev) => prev.filter((a) => !deleted.has(a.id)));
      if (viewingArchive && deleted.has(viewingArchive.id)) setViewingArchive(null);
      setSelectedIds(new Set());
    }

    setBulkDeleting(false);
  };

  return {
    archives,
    filtered,
    loading,
    error,
    search,
    setSearch,
    viewingArchive,
    setViewingArchive,
    expandedId,
    toggleExpand,
    deleting,
    handleDelete,
    formatDate,
    selectedIds,
    allSelected,
    bulkDeleting,
    toggleSelectArchive,
    toggleSelectAll,
    handleBulkDelete,
  };
}
