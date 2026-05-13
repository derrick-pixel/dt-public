import { constantTimeEqual } from './sha256';

// Copy a Uint8Array into a fresh ArrayBuffer. Works around the
// Uint8Array<ArrayBufferLike> vs Uint8Array<ArrayBuffer> typing mismatch
// in newer @cloudflare/workers-types vs Web Crypto APIs.
function toAb(view: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(view.byteLength);
  new Uint8Array(buf).set(view);
  return buf;
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(secret);
  const msgBytes = new TextEncoder().encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    toAb(keyBytes),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, toAb(msgBytes));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacVerify(secret: string, message: string, signatureHex: string): Promise<boolean> {
  const expected = await hmacSha256Hex(secret, message);
  return constantTimeEqual(expected, signatureHex);
}
