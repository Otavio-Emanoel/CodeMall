import crypto from 'crypto';

const SALT_LEN = 16; // bytes
const ITERATIONS = 310000; // Node recommended for PBKDF2
const KEYLEN = 32; // 256 bits
const DIGEST = 'sha256';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN);
  const derived = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST);
  // store as: pbkdf2$iter$digest$saltBase64$hashBase64
  return `pbkdf2$${ITERATIONS}$${DIGEST}$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, iterStr, digest, saltB64, hashB64] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iterations = parseInt(iterStr, 10);
    const salt = Buffer.from(saltB64, 'base64');
    const hash = Buffer.from(hashB64, 'base64');
    const derived = crypto.pbkdf2Sync(password, salt, iterations, hash.length, digest as any);
    return crypto.timingSafeEqual(hash, derived);
  } catch {
    return false;
  }
}
