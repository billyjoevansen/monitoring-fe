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
  };
}
