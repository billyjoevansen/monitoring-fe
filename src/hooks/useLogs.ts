import { useState, useEffect, useMemo, useCallback } from 'react';
import { manageClient } from '@/lib/supabase/client';
import { hasPermission } from '@/config/rbac';
import { PAGE_SIZE } from '@/config/logConfig';
import type { ActivityLog, User } from '@/types';

export function useLogs(currentUser: User) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [logToDelete, setLogToDelete] = useState<ActivityLog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = useMemo(() => hasPermission(currentUser.role, 'view_logs'), [currentUser.role]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.user_nama?.toLowerCase().includes(q) ||
        log.user_email?.toLowerCase().includes(q) ||
        log.detail?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q),
    );
  }, [logs, searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const supabase = manageClient();

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filterAction) query = query.eq('action', filterAction);
    if (filterRole) query = query.eq('user_role', filterRole);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error loading logs:', error);
    } else {
      if (data) setLogs(data as ActivityLog[]);
      if (count !== null) setTotalCount(count);
    }

    setLoading(false);
  }, [page, filterAction, filterRole]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRefresh = () => loadLogs();

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('');
    setFilterRole('');
    setPage(1);
  };

  const updateFilterAction = (value: string) => {
    setFilterAction(value);
    setPage(1);
  };

  const updateFilterRole = (value: string) => {
    setFilterRole(value);
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedLogs.size === filteredLogs.length) {
      setSelectedLogs(new Set());
    } else {
      setSelectedLogs(new Set(filteredLogs.map((log) => log.id)));
    }
  };

  const toggleSelectLog = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  const openDeleteModal = (log: ActivityLog) => {
    setLogToDelete(log);
    setDeleteMode('single');
    setShowDeleteModal(true);
  };

  const openBulkDeleteModal = () => {
    setDeleteMode('bulk');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLogToDelete(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = manageClient();

    try {
      if (deleteMode === 'single' && logToDelete) {
        const { error } = await supabase.from('activity_logs').delete().eq('id', logToDelete.id);
        if (error) throw error;
      } else if (deleteMode === 'bulk' && selectedLogs.size > 0) {
        const { error } = await supabase
          .from('activity_logs')
          .delete()
          .in('id', Array.from(selectedLogs));
        if (error) throw error;
        setSelectedLogs(new Set());
      }

      await loadLogs();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting logs:', error);
      alert('Gagal menghapus log. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    logs,
    filteredLogs,
    loading,
    totalCount,
    totalPages,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    filterAction,
    updateFilterAction,
    filterRole,
    updateFilterRole,
    handleResetFilters,
    selectedLogs,
    toggleSelectAll,
    toggleSelectLog,
    canDelete,
    showDeleteModal,
    deleteMode,
    logToDelete,
    deleting,
    openDeleteModal,
    openBulkDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleRefresh,
  };
}
