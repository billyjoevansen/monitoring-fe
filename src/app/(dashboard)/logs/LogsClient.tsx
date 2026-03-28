'use client';

import { Loader2 } from 'lucide-react';
import { useLogs } from '@/hooks/useLogs';
import { LogsHeader } from '@/components/logs/LogsHeader';
import { LogsFilter } from '@/components/logs/LogsFilter';
import { LogTable } from '@/components/logs/LogTable';
import { LogDialogs } from '@/components/logs/LogDialogs';
import type { User } from '@/types';

export default function LogsClient({ currentUser }: { currentUser: User }) {
  const {
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
  } = useLogs(currentUser);

  return (
    <div>
      <LogsHeader onRefresh={handleRefresh} />

      <LogsFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterAction={filterAction}
        onFilterActionChange={updateFilterAction}
        filterRole={filterRole}
        onFilterRoleChange={updateFilterRole}
        onResetFilters={handleResetFilters}
        totalCount={totalCount}
        canDelete={canDelete}
        selectedCount={selectedLogs.size}
        onBulkDelete={openBulkDeleteModal}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <LogTable
          logs={filteredLogs}
          canDelete={canDelete}
          selectedLogs={selectedLogs}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectLog={toggleSelectLog}
          onDeleteLog={openDeleteModal}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <LogDialogs
        open={showDeleteModal}
        isBulkDelete={deleteMode === 'bulk'}
        logToDelete={logToDelete}
        bulkDeleteCount={selectedLogs.size}
        deleting={deleting}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}
