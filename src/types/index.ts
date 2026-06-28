export * from './rekonsiliasi';
export * from './klasifikasi';
export * from './petani';
export * from './props';
export * from './archive';
import { ClassificationArchive, ReconciliationArchive } from './archive';

// ROLE & PERMISSION
export type Role = 'admin' | 'kabid' | 'kasie' | 'bpp';

export type Permission =
  | 'view_reconciliation'
  | 'view_prediction'
  | 'view_dashboard'
  | 'view_classification'
  | 'view_training'
  | 'upload_files'
  | 'train_model'
  | 'edit_model_config'
  | 'manage_users'
  | 'view_logs'
  | 'view_archives'
  | 'manage_archives'
  | 'view_api'
  | 'view_documents';

// Navbar
export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  children?: NavItem[];
}

export interface NavDropdownProps {
  item: NavItem;
  isOpen: boolean;
  isGroupActive: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  /** Renders children inline (mobile) vs as floating panel (desktop) */
  variant: 'desktop' | 'mobile';
  dropdownRef?: (el: HTMLDivElement | null) => void;
  onNavigate?: () => void;
}

// USER
export interface User {
  id: string;
  email: string;
  nama: string;
  role: Role;
  kecamatan: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// KECAMATAN
export interface Kecamatan {
  id: number;
  nama: string;
  kode: string;
}

// ACTIVITY LOG
export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_nama: string;
  user_role: string;
  action: string;
  detail: string | null;
  created_at: string;
}

// TRAINING RESULT
export interface ClassReportMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface ClassificationReportData {
  NORMAL: ClassReportMetrics;
  TIDAK_NORMAL: ClassReportMetrics;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
  penjelasan?: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
    keterangan?: Record<string, string>;
  };
}

export interface ModelPerformance {
  accuracy: number;
  f1_score_weighted: number;
  oob_score?: number | null;
  classification_report?: ClassificationReportData;
  confusion_matrix?: ConfusionMatrixData;
  feature_importance?: Record<string, number>;
}

export interface FeatureSelection {
  total_fitur_awal: number;
  total_fitur_terpilih: number;
  fitur_terpilih?: string[];
  fitur_dibuang?: string[];
}

export interface ModelFile {
  path?: string;
  size_kb?: number;
}

// Dashboard Client types
export interface DashboardClientProps {
  user: User;
  latestClassification: ClassificationArchive | null;
  latestReconciliation: ReconciliationArchive | null;
  totalClassifications: number;
  totalReconciliations: number;
}

// Label distribution returned by BE /api/train
export interface LabelDistribution {
  [label: string]: number;
}

export interface TrainResult {
  model_performance: ModelPerformance;
  feature_selection?: FeatureSelection;
  model_file?: ModelFile;
  label_distribution?: LabelDistribution;
  massage?: string;
}
