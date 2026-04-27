import { encryptData, decryptData } from './encryption';

/**
 * Encrypt NIK in a single detail object
 */
export function encryptNikInDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const encrypted = { ...detail };

  // Handle both 'nik' and 'NIK' field variations
  if (encrypted.nik && typeof encrypted.nik === 'string') {
    encrypted.nik = encryptData(encrypted.nik);
  }
  if (encrypted.NIK && typeof encrypted.NIK === 'string') {
    encrypted.NIK = encryptData(encrypted.NIK as string);
  }

  return encrypted;
}

/**
 * Decrypt NIK in a single detail object
 */
export function decryptNikInDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const decrypted = { ...detail };

  // Handle both 'nik' and 'NIK' field variations
  if (decrypted.nik && typeof decrypted.nik === 'string') {
    decrypted.nik = decryptData(decrypted.nik);
  }
  if (decrypted.NIK && typeof decrypted.NIK === 'string') {
    decrypted.NIK = decryptData(decrypted.NIK as string);
  }

  return decrypted;
}

/**
 * Encrypt NIK in an array of detail objects
 */
export function encryptNikInDetailArray(
  details: Record<string, unknown>[],
): Record<string, unknown>[] {
  return details.map((detail) => encryptNikInDetail(detail));
}

/**
 * Decrypt NIK in an array of detail objects
 */
export function decryptNikInDetailArray(
  details: Record<string, unknown>[],
): Record<string, unknown>[] {
  return details.map((detail) => decryptNikInDetail(detail));
}
