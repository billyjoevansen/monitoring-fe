export const KECAMATAN_LIST = [
  'Kecamatan Cipocok Jaya',
  'Kecamatan Curug',
  'Kecamatan Kasemen',
  'Kecamatan Serang',
  'Kecamatan Taktakan',
  'Kecamatan Walantaka',
] as const;

export type KecamatanName = (typeof KECAMATAN_LIST)[number];
