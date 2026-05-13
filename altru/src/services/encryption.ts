import type { Env } from '../types';

// AES-256-GCM column encryption for NRIC and other PII at rest.
// Output format: "<iv-b64>.<ciphertext-and-tag-b64>".
// The key comes from env.NRIC_ENCRYPTION_KEY (base64, 32 bytes after decode).

export async function encrypt(env: Env, plaintext: string): Promise<string> {
  const key = await getKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ptBytes = new TextEncoder().encode(plaintext);
  const ctBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toAb(iv) },
    key,
    toAb(ptBytes)
  );
  return `${b64(iv)}.${b64(new Uint8Array(ctBuf))}`;
}

export async function decrypt(env: Env, ciphertext: string): Promise<string> {
  const [ivPart, ctPart] = ciphertext.split('.');
  if (!ivPart || !ctPart) throw new Error('Invalid ciphertext format');
  const key = await getKey(env);
  const iv = unb64(ivPart);
  const ct = unb64(ctPart);
  const ptBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toAb(iv) },
    key,
    toAb(ct)
  );
  return new TextDecoder().decode(ptBuf);
}

async function getKey(env: Env): Promise<CryptoKey> {
  const raw = unb64(env.NRIC_ENCRYPTION_KEY);
  if (raw.byteLength !== 32) {
    throw new Error(`NRIC_ENCRYPTION_KEY must be 32 bytes (base64); got ${raw.byteLength}`);
  }
  return crypto.subtle.importKey('raw', toAb(raw), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

// Copy a Uint8Array into a fresh ArrayBuffer. Works around a typing mismatch
// where newer @cloudflare/workers-types use Uint8Array<ArrayBufferLike> but
// Web Crypto APIs expect Uint8Array<ArrayBuffer> / concrete BufferSource.
function toAb(view: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(view.byteLength);
  new Uint8Array(buf).set(view);
  return buf;
}

function b64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function unb64(s: string): Uint8Array {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
