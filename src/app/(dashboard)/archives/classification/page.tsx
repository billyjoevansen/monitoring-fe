'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  BrainCircuit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { manageClient } from '@/lib/supabase/client';
import { logActivity } from '@/lib/auth';
import ResultTable from '@/components/ResultTable';
import type { ClassificationSummary } from '@/types';
import { hasPermission } from '@/lib/rbac';

interface ClassificationArchive {
  id: string;
  user_id: string;
  user_nama: string;
  reconciliation_id: string;
  nama_arsip: string;
  summary: ClassificationSummary;
  detail: Record<string, unknown>[];
  created_at: string;
}

const classifyColumns = [
  { key: 'nama_petani', label: 'Nama Petani' },
  { key: 'nik', label: 'NIK' },
  { key: 'poktan', label: 'Poktan' },
  { key: 'status', label: 'Status' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'kios_sesuai', label: 'Kios Sesuai' },
  { key: 'total_pupuk_diajukan_kg', label: 'Diajukan (kg)' },
  { key: 'total_pupuk_ditebus_kg', label: 'Ditebus (kg)' },
  { key: 'selisih_total_kg', label: 'Selisih (kg)' },
];

export default function ClassificationArchivesPage() {
  const user = useUser();
  const canEdit = hasPermission(user.role, 'manage_archives');
  const [archives, setArchives] = useState<ClassificationArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewingArchive, setViewingArchive] = useState<ClassificationArchive | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadArchives();
  }, []);

  const loadArchives = async () => {
    const supabase = manageClient();
    const { data } = await supabase
      .from('classification_archives')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setArchives(data as ClassificationArchive[]);
    setLoading(false);
  };

  const handleDelete = async (archive: ClassificationArchive) => {
    if (!confirm(`Hapus arsip "${archive.nama_arsip}"? Tindakan ini tidak dapat dibatalkan.`))
      return;

    setDeleting(archive.id);
    const supabase = manageClient();

    const { error } = await supabase.from('classification_archives').delete().eq('id', archive.id);

    if (!error) {
      await logActivity(
        'delete_classification',
        `Menghapus arsip klasifikasi: ${archive.nama_arsip}`,
      );
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            label="Total Petani"
            value={viewingArchive.summary.total_petani}
            color="blue"
          />
          <SummaryCard
            label="Normal"
            value={viewingArchive.summary.normal}
            sub={`${viewingArchive.summary.persentase_normal}%`}
            color="green"
          />
          <SummaryCard
            label="Tidak Normal"
            value={viewingArchive.summary.tidak_normal}
            sub={`${viewingArchive.summary.persentase_tidak_normal}%`}
            color="red"
          />
        </div>

        <ResultTable columns={classifyColumns} data={viewingArchive.detail} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Arsip Klasifikasi</h1>
          <p className="text-gray-500 mt-1">Riwayat hasil klasifikasi yang telah disimpan</p>
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
          <BrainCircuit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Belum ada arsip klasifikasi.</p>
          <p className="text-gray-400 text-sm mt-1">Lakukan klasifikasi dan simpan hasilnya.</p>
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
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <MiniCard label="Total Petani" value={archive.summary.total_petani} />
                      <MiniCard
                        label="Normal"
                        value={`${archive.summary.normal} (${archive.summary.persentase_normal}%)`}
                      />
                      <MiniCard
                        label="Tidak Normal"
                        value={`${archive.summary.tidak_normal} (${archive.summary.persentase_tidak_normal}%)`}
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

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-75 mt-0.5">{sub}</p>}
    </div>
  );
}
