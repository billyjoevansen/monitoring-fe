export interface PupukDetail {
  diajukan_kg?: number;
  ditebus_kg?: number;
  selisih_kg?: number;
  rasio?: number;
  status?: string;
}

export interface PetaniRow {
  nama_petani: string;
  nik: string;
  poktan: string;
  gapoktan: string;
  alamat: string;
  penyuluh: string;
  kios_rdkk: string;
  kios_penebusan: string;
  kios_sesuai: boolean;
  total_luas_lahan_ha: number;
  jumlah_mt_aktif: number;
  pupuk: Record<string, PupukDetail>;
  sp36_tebus_kg: number;
  organik_cair_tebus_kg: number;
  total_pupuk_diajukan_kg: number;
  total_pupuk_ditebus_kg: number;
  selisih_total_kg: number;
  status_tebus: string;
  catatan: string[];
}
