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

export interface OverfittingAnalysis {
  accuracy_gap: number;
  f1_gap: number;
  is_overfitting: boolean;
  keterangan: string;
}

export interface ModelPerformance {
  accuracy: number;
  f1_score_weighted: number;
  oob_score?: number | null;
  roc_auc?: number;
  roc_curve_data?: {
    fpr: number[];
    tpr: number[];
    roc_auc: number;
  };
  classification_report?: ClassificationReportData;
  confusion_matrix?: ConfusionMatrixData;
  feature_importance?: Record<string, number>;
  train?: {
    accuracy: number;
    f1_score_weighted: number;
    oob_score?: number | null;
    classification_report?: ClassificationReportData;
    confusion_matrix?: ConfusionMatrixData;
  };
  test?: {
    accuracy: number;
    f1_score_weighted: number;
    classification_report?: ClassificationReportData;
    confusion_matrix?: ConfusionMatrixData;
  };
  overfitting_analysis?: OverfittingAnalysis;
}

export interface FeatureSelection {
  total_fitur_awal: number;
  total_fitur_terpilih: number;
  fitur_terpilih?: string[];
  fitur_dibuang?: string[];
  feature_frequency?: Record<string, number>;
  frequency_threshold?: number;
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
  activities: Array<{ id: number; action: string; created_at: string }>;
}

// Label distribution returned by BE /api/train
export interface LabelDistribution {
  [label: string]: number;
}

export interface CvResult {
  rank: number;
  params: Record<string, unknown>;
  mean_f1: number;
  std_f1: number;
  fold_scores: number[];
  fold_features?: string[][];
}

export interface TuningResult {
  method: string;
  n_folds: number;
  total_combinations: number;
  best_params: Record<string, unknown>;
  best_cv_f1: number;
  cv_results: CvResult[];
}

export interface TrainResult {
  model_performance: ModelPerformance;
  feature_selection?: FeatureSelection;
  model_file?: ModelFile;
  label_distribution?: LabelDistribution;
  tuning?: TuningResult;
  method?: 'tuning' | 'direct';
  message?: string;
}
