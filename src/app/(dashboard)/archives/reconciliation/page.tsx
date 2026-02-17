'use client';

import { useEffect, useState } from 'react';
import { Loader2, FileStack, Trash2, Eye, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { createClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth';
import ReconcileTable from '@/components/ReconcileTable';
import type { ReconciliationArchive } from '@/types';
import { hasPermission } from '@/lib/rbac';

export default function ReconciliationArchivesPage() {
  const user = useUser();
  const canEdit = hasPermission(user.role, 'manage_archives');
  const [archives, setArchives] = useState<ReconciliationArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingArchive, setViewingArchive] = useState<ReconciliationArchive | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('reconciliation_archives')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArchives(data as ReconciliationArchive[]);
    setLoading(false);
  };

  const handleDelete = async (archive: ReconciliationArchive) => {
    if (!confirm(`Hapus arsip "${archive.nama_arsip}"? Tindakan ini tidak dapat dibatalkan.`))
      return;

    setDeleting(archive.id);
    const supabase = createClient();

    const { error } = await supabase.from('reconciliation_archives').delete().eq('id', archive.id);

    if (!error) {
      await logActivity('delete_archive', `Menghapus arsip rekonsiliasi: ${archive.nama_arsip}`);
      setArchives((prev) => prev.filter((a) => a.id !== archive.id));
      if (viewingArchive?.id === archive.id) setViewingArchive(null);
    }
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = archives.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.nama_arsip.toLowerCase().includes(q) || a.user_nama.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Mode: viewing detail
  if (viewingArchive) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{viewingArchive.nama_arsip}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewingArchive.user_nama} · {formatDate(viewingArchive.created_at)} ·{' '}
              {viewingArchive.summary.total_petani} petani
            </p>
          </div>
          <button
            onClick={() => setViewingArchive(null)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            ← Kembali
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <SummaryCard
            label="Total Petani"
            value={viewingArchive.summary.total_petani}
            color="blue"
          />
          <SummaryCard
            label="Tebus Lengkap"
            value={viewingArchive.summary.status_penebusan.tebus_lengkap}
            color="green"
          />
          <SummaryCard
            label="Tebus Sebagian"
            value={viewingArchive.summary.status_penebusan.tebus_sebagian}
            color="yellow"
          />
          <SummaryCard
            label="Tebus Melebihi"
            value={viewingArchive.summary.status_penebusan.tebus_melebihi}
            color="red"
          />
          <SummaryCard
            label="Belum Menebus"
            value={viewingArchive.summary.status_penebusan.belum_menebus}
            color="orange"
          />
          <SummaryCard
            label="Kios Tidak Sesuai"
            value={viewingArchive.summary.kios.tidak_sesuai}
            color="purple"
          />
        </div>

        <ReconcileTable data={viewingArchive.detail} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <FileStack className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Arsip Rekonsiliasi</h1>
          <p className="text-gray-500 mt-1">Riwayat hasil rekonsiliasi yang telah disimpan</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari arsip..."
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileStack className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada arsip rekonsiliasi.</p>
          <p className="text-gray-400 text-sm mt-1">Lakukan rekonsiliasi dan simpan hasilnya.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((archive) => (
              <div key={archive.id}>
                <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => setExpandedId(expandedId === archive.id ? null : archive.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedId === archive.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    <div>
                      <p className="font-semibold text-gray-800">{archive.nama_arsip}</p>
                      <p className="text-xs text-gray-500">
                        {archive.user_nama} · {formatDate(archive.created_at)} ·{' '}
                        {archive.summary.total_petani} petani
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingArchive(archive)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDelete(archive)}
                      disabled={deleting === archive.id}
                      className={`${canEdit ? 'flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium' : 'hidden'}`}
                    >
                      {deleting === archive.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Hapus
                    </button>
                  </div>
                </div>

                {expandedId === archive.id && (
                  <div className="px-14 pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <MiniCard label="Total Petani" value={archive.summary.total_petani} />
                      <MiniCard
                        label="Tebus Lengkap"
                        value={archive.summary.status_penebusan.tebus_lengkap}
                      />
                      <MiniCard
                        label="Tebus Sebagian"
                        value={archive.summary.status_penebusan.tebus_sebagian}
                      />
                      <MiniCard
                        label="Kios Sesuai"
                        value={`${archive.summary.kios.persentase_sesuai}%`}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-800">{String(value)}</p>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
      <p className="text-[10px] font-medium opacity-75 uppercase">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}
