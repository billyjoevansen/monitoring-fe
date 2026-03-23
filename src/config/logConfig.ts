export const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login: { label: 'Login', color: 'bg-blue-100 text-blue-700' },
  logout: { label: 'Logout', color: 'bg-gray-100 text-gray-700' },
  reconcile: { label: 'Rekonsiliasi', color: 'bg-green-100 text-green-700' },
  train_model: { label: 'Training Model', color: 'bg-purple-100 text-purple-700' },
  predict: { label: 'Prediksi', color: 'bg-indigo-100 text-indigo-700' },
  update_config: { label: 'Ubah Konfigurasi', color: 'bg-yellow-100 text-yellow-700' },
  reset_config: { label: 'Reset Konfigurasi', color: 'bg-orange-100 text-orange-700' },
  create_user: { label: 'Buat User', color: 'bg-teal-100 text-teal-700' },
  update_user: { label: 'Edit User', color: 'bg-cyan-100 text-cyan-700' },
  activate_user: { label: 'Aktifkan User', color: 'bg-emerald-100 text-emerald-700' },
  deactivate_user: { label: 'Nonaktifkan User', color: 'bg-red-100 text-red-700' },
  change_password: { label: 'Ganti Password', color: 'bg-amber-100 text-amber-700' },
};

export const PAGE_SIZE = 15;
