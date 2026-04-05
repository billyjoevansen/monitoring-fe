import { BrainCircuit, FileStack, Archive, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface ArchiveCard {
  href: string;
  label: string;
  sub: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  hoverBorder: string;
  hoverIconColor: string;
  countKey: 'classification' | 'reconciliation';
}

const ARCHIVE_CARDS: ArchiveCard[] = [
  {
    href: '/archives/reconciliation',
    label: 'Arsip Rekonsiliasi',
    sub: 'Total arsip rekonsiliasi tersimpan',
    Icon: FileStack,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    hoverBorder: 'hover:border-amber-300',
    hoverIconColor: 'group-hover:text-amber-500',
    countKey: 'reconciliation',
  },
  {
    href: '/archives/classification',
    label: 'Arsip Klasifikasi',
    sub: 'Total arsip klasifikasi tersimpan',
    Icon: BrainCircuit,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    hoverBorder: 'hover:border-purple-300',
    hoverIconColor: 'group-hover:text-purple-500',
    countKey: 'classification',
  },
];

interface ArchiveSlideProps {
  totalClassifications: number;
  totalReconciliations: number;
}

export default function ArchiveSlide({ totalClassifications, totalReconciliations }: ArchiveSlideProps) {
  const counts = {
    classification: totalClassifications,
    reconciliation: totalReconciliations,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ARCHIVE_CARDS.map(({ href, label, sub, Icon, iconColor, iconBg, hoverBorder, hoverIconColor, countKey }) => (
          <Link
            key={href}
            href={href}
            className={`group bg-background rounded-2xl border border-gray-200 shadow-sm p-6 ${hoverBorder} hover:shadow-md transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
              >
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <ArrowRight
                className={`w-4 h-4 text-gray-300 ${hoverIconColor} transition-colors`}
              />
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{counts[countKey]}</p>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">
              Total Semua Arsip
            </p>
            <p className="text-3xl font-black text-green-700 dark:text-green-400 mt-1">
              {totalClassifications + totalReconciliations}
            </p>
            <p className="text-xs text-green-600 mt-1">rekonsiliasi + klasifikasi tersimpan</p>
          </div>
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center">
            <Archive className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
