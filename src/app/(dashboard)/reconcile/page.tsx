'use client';

import { useState } from 'react';
import {
  Loader2,
  FileSearch,
  AlertTriangle,
  XCircle,
  Save,
  CheckCircle,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useUser } from '@/lib/UserContext';
import { hasPermission } from '@/lib/rbac';
import { reconcile } from '@/lib/api';
import { logActivity } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import FileUploader from '@/components/FileUploader';
import ReconcileTable from '@/components/ReconcileTable';

interface PupukSummary {
  total_diajukan_kg: number;
  total_ditebus_kg: number;
  selisih_kg: number;
  persentase_tebus: number;
}

interface ReconcileSummary {
  total_petani: number;
  status_penebusan: {
    tebus_lengkap: number;
    tebus_sebagian: number;
    tebus_melebihi: number;
    belum_menebus: number;
    tidak_ada_pengajuan?: number;
  };
  kios: {
    sesuai: number;
    tidak_sesuai: number;
    persentase_sesuai: number;
  };
  pupuk: Record<string, PupukSummary>;
  total_pupuk_diajukan_kg: number;
  total_pupuk_ditebus_kg: number;
}

interface ReconcileResult {
  summary: ReconcileSummary;
  detail: Record<string, unknown>[];
}

export default function ReconcilePage() {
  const user = useUser();
  const canUpload = hasPermission(user.role, 'upload_files');

  const [rdkkFile, setRdkkFile] = useState<File | null>(null);
  const [sivervalFile, setSivervalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReconcileResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [namaArsip, setNamaArsip] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProcess = async () => {
    if (!rdkkFile || !sivervalFile) {
      setError('Upload kedua file terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const data = await reconcile(rdkkFile, sivervalFile);
      setResult(data);
      setNamaArsip(rdkkFile.name.replace(/\.[^/.]+$/, ''));
      await logActivity('reconcile', `Rekonsiliasi ${data.summary.total_petani} petani`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Terjadi kesalahan.');
      } else {
        setError('Gagal terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!result || !namaArsip.trim()) {
      setError('Masukkan nama arsip.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: insertErr } = await supabase.from('reconciliation_archives').insert({
        user_id: user.id,
        user_nama: user.nama,
        nama_arsip: namaArsip.trim(),
        summary: result.summary,
        detail: result.detail,
      });

      if (insertErr) throw insertErr;

      await logActivity('save_archive', `Menyimpan arsip rekonsiliasi: ${namaArsip}`);
      setSaved(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setRdkkFile(null);
    setSivervalFile(null);
    setError(null);
    setSaved(false);
    setNamaArsip('');
  };

  if (!canUpload) {
    return (
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Rekonsiliasi</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Role Anda tidak memiliki akses untuk upload file.</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileSearch className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Rekonsiliasi</h1>
          <p className="text-gray-500 mt-1">Bandingkan data RDKK dengan SIVERVAL</p>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex gap-6">
          <FileUploader
            label="Data RDKK"
            description="File Excel data pengajuan pupuk"
            file={rdkkFile}
            onFileChange={setRdkkFile}
          />
          <FileUploader
            label="Data SIVERVAL"
            description="File Excel data penebusan pupuk"
            file={sivervalFile}
            onFileChange={setSivervalFile}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleProcess}
            disabled={loading || !rdkkFile || !sivervalFile}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <FileSearch className="w-5 h-5" />
                Mulai Rekonsiliasi
              </>
            )}
          </button>
          {result && (
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <SummaryCard label="Total Petani" value={result.summary.total_petani} color="blue" />
            <SummaryCard
              label="Tebus Lengkap"
              value={result.summary.status_penebusan.tebus_lengkap}
              color="green"
            />
            <SummaryCard
              label="Tebus Sebagian"
              value={result.summary.status_penebusan.tebus_sebagian}
              color="yellow"
            />
            <SummaryCard
              label="Tebus Melebihi"
              value={result.summary.status_penebusan.tebus_melebihi}
              color="red"
            />
            <SummaryCard
              label="Belum Menebus"
              value={result.summary.status_penebusan.belum_menebus}
              color="orange"
            />
            <SummaryCard
              label="Kios Tidak Sesuai"
              value={result.summary.kios.tidak_sesuai}
              color="purple"
            />
          </div>

          {/* Save + Download */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
            {saved ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Tersimpan ke arsip!</span>
                </div>
                <DownloadButtons detail={result.detail} summary={result.summary} />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={namaArsip}
                  onChange={(e) => setNamaArsip(e.target.value)}
                  placeholder="Nama arsip (misal: Rekon Kec. Serang Jan 2025)"
                  autoComplete="off"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveToArchive}
                    disabled={saving || !namaArsip.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan
                  </button>
                  <DownloadButtons detail={result.detail} summary={result.summary} />
                </div>
              </div>
            )}
          </div>

          {/* Tabel Lengkap */}
          <ReconcileTable data={result.detail} />
        </>
      )}
    </div>
  );
}

/* ==============================
   Download Buttons (Excel + PDF)
   ============================== */
const PUPUK_KEYS = ['urea', 'npk', 'za', 'npk_formula', 'organik'];

function DownloadButtons({
  detail,
  summary,
}: {
  detail: Record<string, unknown>[];
  summary: ReconcileSummary;
}) {
  const handleExcel = async () => {
    const ExcelJS = await import('exceljs');
    const { saveAs } = await import('file-saver');

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Monitoring Pupuk Subsidi';
    wb.created = new Date();

    // ========== Sheet 1: Detail ==========
    const ws = wb.addWorksheet('Rekonsiliasi', {
      views: [{ state: 'frozen', ySplit: 2, xSplit: 2 }],
    });

    // Header groups (row 1 — merged)
    const headerRow1 = ws.addRow([
      'No',
      'Nama Petani',
      'NIK',
      'Poktan',
      'Gapoktan',
      'Alamat',
      'Penyuluh',
      'Kios RDKK',
      'Kios Penebusan',
      'Kios Sesuai',
      'Luas Lahan (ha)',
      'Jml MT',
      'Urea',
      '',
      '',
      '',
      'NPK',
      '',
      '',
      '',
      'ZA',
      '',
      '',
      '',
      'NPK Formula',
      '',
      '',
      '',
      'Organik',
      '',
      '',
      '',
      'SP36 Tebus',
      'Org. Cair Tebus',
      'Total Diajukan',
      'Total Ditebus',
      'Selisih Total',
      'Status Tebus',
      'Catatan',
    ]);

    // Merge pupuk group headers
    const pupukStartCol = 13;
    for (let i = 0; i < 5; i++) {
      const startCol = pupukStartCol + i * 4;
      ws.mergeCells(1, startCol, 1, startCol + 3);
    }

    // Header sub-columns (row 2)
    const subHeaders: string[] = [
      'No',
      'Nama Petani',
      'NIK',
      'Poktan',
      'Gapoktan',
      'Alamat',
      'Penyuluh',
      'Kios RDKK',
      'Kios Penebusan',
      'Kios Sesuai',
      'Luas Lahan (ha)',
      'Jml MT',
    ];
    for (let i = 0; i < 5; i++) {
      subHeaders.push('Ajukan (kg)', 'Tebus (kg)', 'Selisih (kg)', 'Status');
    }
    subHeaders.push('(kg)', '(kg)', '(kg)', '(kg)', '(kg)', '', '');
    ws.addRow(subHeaders);

    // Merge non-pupuk headers vertically (row 1-2)
    for (let col = 1; col <= 12; col++) {
      ws.mergeCells(1, col, 2, col);
    }
    for (let col = 33; col <= 38; col++) {
      if (col <= ws.columnCount) ws.mergeCells(1, col, 2, col);
    }

    // Style headers
    const headerFill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FF22784A' },
    };
    const headerFont = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    const headerAlignment = {
      horizontal: 'center' as const,
      vertical: 'middle' as const,
      wrapText: true,
    };
    const thinBorder = {
      top: { style: 'thin' as const },
      left: { style: 'thin' as const },
      bottom: { style: 'thin' as const },
      right: { style: 'thin' as const },
    };

    [1, 2].forEach((rowNum) => {
      const row = ws.getRow(rowNum);
      row.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = headerAlignment;
        cell.border = thinBorder;
      });
      row.height = 28;
    });

    // Data rows
    detail.forEach((d, idx) => {
      const pupuk = (d.pupuk || {}) as Record<string, Record<string, unknown>>;
      const values: (string | number | boolean)[] = [
        idx + 1,
        String(d.nama_petani ?? ''),
        String(d.nik ?? ''),
        String(d.poktan ?? ''),
        String(d.gapoktan ?? ''),
        String(d.alamat ?? ''),
        String(d.penyuluh ?? ''),
        String(d.kios_rdkk ?? ''),
        String(d.kios_penebusan ?? ''),
        d.kios_sesuai ? 'Ya' : 'Tidak',
        Number(d.total_luas_lahan_ha ?? 0),
        Number(d.jumlah_mt_aktif ?? 0),
      ];

      for (const p of PUPUK_KEYS) {
        const pd = pupuk[p] || {};
        values.push(
          Number(pd.diajukan_kg ?? 0),
          Number(pd.ditebus_kg ?? 0),
          Number(pd.selisih_kg ?? 0),
          String(pd.status ?? '-'),
        );
      }
      /*************  ✨ Windsurf Command ⭐  *************/
      /**
       * Download an Excel file containing the detail and summary of the reconciliation.
       * The file will have two sheets: 'Rekonsiliasi' and 'Ringkasan'.
       * The 'Rekonsiliasi' sheet will contain all the detail data, with auto-width columns.
       * The 'Ringkasan' sheet will contain the summary data, with two columns: 'Keterangan' and 'Nilai'.
       * The file will be named 'rekonsiliasi_<date>.xlsx', where <date> is the current date in ISO format (yyyy-mm-dd).
       */
      /*******  c390e2e7-5a53-4a2d-9f57-a5c1b5909b29  *******/
      values.push(
        Number(d.sp36_tebus_kg ?? 0),
        Number(d.organik_cair_tebus_kg ?? 0),
        Number(d.total_pupuk_diajukan_kg ?? 0),
        Number(d.total_pupuk_ditebus_kg ?? 0),
        Number(d.selisih_total_kg ?? 0),
        String(d.status_tebus ?? ''),
        Array.isArray(d.catatan) ? (d.catatan as string[]).join('; ') : '',
      );

      const row = ws.addRow(values);

      // Alternating row color
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F7FA' } };
        });
      }

      row.eachCell((cell) => {
        cell.border = thinBorder;
        cell.font = { size: 9 };
        cell.alignment = { vertical: 'middle' };
      });

      // Kios Sesuai coloring
      const kiosCell = row.getCell(10);
      if (kiosCell.value === 'Tidak') {
        kiosCell.font = { size: 9, bold: true, color: { argb: 'FFDC2626' } };
      }

      // Status coloring
      const statusCell = row.getCell(values.length - 1);
      const status = String(statusCell.value);
      if (status === 'TEBUS LENGKAP') {
        statusCell.font = { size: 9, bold: true, color: { argb: 'FF16A34A' } };
      } else if (status === 'BELUM MENEBUS' || status === 'TEBUS MELEBIHI') {
        statusCell.font = { size: 9, bold: true, color: { argb: 'FFDC2626' } };
      } else if (status === 'TEBUS SEBAGIAN') {
        statusCell.font = { size: 9, bold: true, color: { argb: 'FFCA8A04' } };
      }
    });

    // Column widths
    const colWidths = [
      5,
      22,
      20,
      16,
      16,
      20,
      16,
      16,
      16,
      10,
      12,
      8,
      ...Array(20).fill(12),
      12,
      12,
      14,
      14,
      12,
      18,
      35,
    ];
    colWidths.forEach((w, i) => {
      const col = ws.getColumn(i + 1);
      col.width = w;
    });

    // ========== Sheet 2: Ringkasan ==========
    const ws2 = wb.addWorksheet('Ringkasan');
    ws2.addRow(['Keterangan', 'Nilai']).eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.border = thinBorder;
    });

    const summaryData = [
      ['Total Petani', summary.total_petani],
      ['Tebus Lengkap', summary.status_penebusan.tebus_lengkap],
      ['Tebus Sebagian', summary.status_penebusan.tebus_sebagian],
      ['Tebus Melebihi', summary.status_penebusan.tebus_melebihi],
      ['Belum Menebus', summary.status_penebusan.belum_menebus],
      ['Kios Sesuai', summary.kios.sesuai],
      ['Kios Tidak Sesuai', summary.kios.tidak_sesuai],
      ['% Kios Sesuai', `${summary.kios.persentase_sesuai}%`],
      ['Total Diajukan (kg)', summary.total_pupuk_diajukan_kg],
      ['Total Ditebus (kg)', summary.total_pupuk_ditebus_kg],
    ];
    summaryData.forEach((row) => {
      const r = ws2.addRow(row);
      r.eachCell((cell) => {
        cell.border = thinBorder;
        cell.font = { size: 10 };
      });
    });
    ws2.getColumn(1).width = 25;
    ws2.getColumn(2).width = 18;

    // Generate & download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `rekonsiliasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    doc.setFontSize(14);
    doc.text('Laporan Rekonsiliasi Pupuk Subsidi', 14, 15);
    doc.setFontSize(9);
    doc.text(
      `Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      14,
      21,
    );
    doc.text(
      `Total Petani: ${summary.total_petani}  |  Tebus Lengkap: ${summary.status_penebusan.tebus_lengkap}  |  Tebus Sebagian: ${summary.status_penebusan.tebus_sebagian}  |  Belum Menebus: ${summary.status_penebusan.belum_menebus}`,
      14,
      26,
    );

    const headers = [
      'No',
      'Nama Petani',
      'NIK',
      'Poktan',
      'Kios RDKK',
      'Kios Tebus',
      'Kios ✓',
      'Urea Aj.',
      'Urea Tb.',
      'NPK Aj.',
      'NPK Tb.',
      'ZA Aj.',
      'ZA Tb.',
      'NPK F. Aj.',
      'NPK F. Tb.',
      'Org. Aj.',
      'Org. Tb.',
      'Tot. Aj.',
      'Tot. Tb.',
      'Selisih',
      'Status',
    ];

    const body: (string | number)[][] = detail.map((d, idx) => {
      const pupuk = (d.pupuk || {}) as Record<string, Record<string, number>>;
      return [
        idx + 1,
        String(d.nama_petani ?? ''),
        String(d.nik ?? ''),
        String(d.poktan ?? ''),
        String(d.kios_rdkk ?? ''),
        String(d.kios_penebusan ?? ''),
        d.kios_sesuai ? 'Ya' : 'Tidak',
        pupuk.urea?.diajukan_kg ?? 0,
        pupuk.urea?.ditebus_kg ?? 0,
        pupuk.npk?.diajukan_kg ?? 0,
        pupuk.npk?.ditebus_kg ?? 0,
        pupuk.za?.diajukan_kg ?? 0,
        pupuk.za?.ditebus_kg ?? 0,
        pupuk.npk_formula?.diajukan_kg ?? 0,
        pupuk.npk_formula?.ditebus_kg ?? 0,
        pupuk.organik?.diajukan_kg ?? 0,
        pupuk.organik?.ditebus_kg ?? 0,
        Number(d.total_pupuk_diajukan_kg ?? 0),
        Number(d.total_pupuk_ditebus_kg ?? 0),
        Number(d.selisih_total_kg ?? 0),
        String(d.status_tebus ?? ''),
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: body,
      styles: { fontSize: 6, cellPadding: 1.5 },
      headStyles: { fillColor: [34, 120, 74], fontSize: 6, fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 7 },
        1: { cellWidth: 28 },
        2: { cellWidth: 22 },
        3: { cellWidth: 18 },
        6: { halign: 'center', cellWidth: 10 },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right' },
        13: { halign: 'right' },
        14: { halign: 'right' },
        15: { halign: 'right' },
        16: { halign: 'right' },
        17: { halign: 'right', fontStyle: 'bold' },
        18: { halign: 'right', fontStyle: 'bold' },
        19: { halign: 'right', fontStyle: 'bold' },
        20: { halign: 'center', cellWidth: 20 },
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 7, right: 7 },
    });

    doc.save(`rekonsiliasi_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExcel}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </button>
      <button
        onClick={handlePdf}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        PDF
      </button>
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
