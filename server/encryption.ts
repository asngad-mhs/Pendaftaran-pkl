import crypto from 'crypto';

// Default master encryption key for AES-256-GCM (32 bytes)
const SECRET = process.env.ENCRYPTION_SECRET || 'pkl_secure_system_aes256_master_key_2026!';
// Derive a 32-byte key using SHA-256
const KEY = crypto.createHash('sha256').update(SECRET).digest();

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a string using AES-256-GCM
 */
export function encryptField(plainText: string): EncryptedPayload {
  if (!plainText) {
    return { cipherText: '', iv: '', tag: '' };
  }
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    cipherText: encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypts a string using AES-256-GCM
 */
export function decryptField(payload: EncryptedPayload): string {
  if (!payload.cipherText || !payload.iv || !payload.tag) {
    return '';
  }
  try {
    const ivBuffer = Buffer.from(payload.iv, 'hex');
    const tagBuffer = Buffer.from(payload.tag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, ivBuffer);
    decipher.setAuthTag(tagBuffer);

    let decrypted = decipher.update(payload.cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption failed:', err);
    return '[Gagal Mendekripsi - Kunci Tidak Valid]';
  }
}

/**
 * Masks NIK (e.g., 3201234567890001 -> 3201••••••••0001)
 */
export function maskNik(nik: string): string {
  if (!nik) return '••••••••••••••••';
  const clean = nik.trim();
  if (clean.length < 8) return '••••••••';
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}••••••••${end}`;
}

/**
 * Masks Phone Number (e.g., 081234567890 -> 0812••••7890)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '••••••••••••';
  const clean = phone.trim();
  if (clean.length < 6) return '••••••••';
  const start = clean.slice(0, 4);
  const end = clean.slice(-3);
  return `${start}••••${end}`;
}

/**
 * Calculates SHA-256 checksum for document integrity verification
 */
export function calculateChecksum(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
