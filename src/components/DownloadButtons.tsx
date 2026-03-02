'use client';

import { FileSpreadsheet, FileText } from 'lucide-react';
import { DownloadButtonsProps, PUPUK_KEYS, ReconcileDetailItem } from '@/types';

export default function DownloadButtons({ detail, summary }: DownloadButtonsProps) {
  /**
   * Handle ekspor ke format Excel (.xlsx)
   */
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
    detail.forEach((d: ReconcileDetailItem, idx: number) => {
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

  /**
   * Handle ekspor ke format PDF
   */
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

    const body: (string | number)[][] = detail.map((d: ReconcileDetailItem, idx: number) => {
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
