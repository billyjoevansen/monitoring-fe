import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';

if (!ENCRYPTION_KEY) {
  console.warn(
    'WARNING: NEXT_PUBLIC_ENCRYPTION_KEY is not set. Encryption will not work properly.',
  );
}

/**
 * Encrypt data using AES
 */
export function encryptData(plaintext: string): string {
  if (!plaintext) return '';

  try {
    const encrypted = CryptoJS.AES.encrypt(plaintext, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return plaintext;
  }
}

export function decryptData(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') return '';

  try {
    const decrypted = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    try {
      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (decryptedStr && decryptedStr.length > 0) {
        return decryptedStr;
      }
    } catch (utf8Error) {
      return ciphertext;
    }

    return ciphertext;
  } catch (error) {
    console.warn('Decryption failed, treating as plaintext:', error);
    return ciphertext;
  }
}
