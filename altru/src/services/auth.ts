import type { Env } from '../types';
import { nowSeconds } from '../lib/time';
import { randomHexToken, sha256Hex } from '../lib/sha256';

const MAGIC_LINK_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function requestMagicLink(env: Env, email: string): Promise<{ token: string }> {
  const token = randomHexToken(32);
  const tokenHash = await sha256Hex(token);
  const now = nowSeconds();
  const expiresAt = now + MAGIC_LINK_TTL_SECONDS;
  await env.DB.prepare(
    `INSERT INTO otp_codes (code_hash, purpose, subject_type, subject_ref, created_at, expires_at)
     VALUES (?, 'magic_link', 'email', ?, ?, ?)`
  )
    .bind(tokenHash, email.toLowerCase(), now, expiresAt)
    .run();
  return { token };
}

export async function verifyMagicLink(env: Env, token: string): Promise<{ email: string } | null> {
  const tokenHash = await sha256Hex(token);
  const now = nowSeconds();
  const row = await env.DB.prepare(
    `SELECT subject_ref FROM otp_codes
     WHERE code_hash = ?
       AND purpose = 'magic_link'
       AND expires_at > ?
       AND consumed_at IS NULL`
  )
    .bind(tokenHash, now)
    .first<{ subject_ref: string }>();
  if (!row) return null;
  await env.DB.prepare(`UPDATE otp_codes SET consumed_at = ? WHERE code_hash = ?`)
    .bind(now, tokenHash)
    .run();
  return { email: row.subject_ref };
}

export async function createSession(
  env: Env,
  coupleId: string,
  userAgent: string,
  ipAddress: string
): Promise<{ token: string; expiresAt: number }> {
  const token = randomHexToken(32);
  const tokenHash = await sha256Hex(token);
  const now = nowSeconds();
  const expiresAt = now + SESSION_TTL_SECONDS;
  await env.DB.prepare(
    `INSERT INTO sessions (token_hash, couple_id, created_at, last_used_at, expires_at, user_agent, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(tokenHash, coupleId, now, now, expiresAt, userAgent.slice(0, 200), ipAddress.slice(0, 64))
    .run();
  return { token, expiresAt };
}

export async function getCoupleFromSession(
  env: Env,
  token: string | null
): Promise<{ coupleId: string } | null> {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const now = nowSeconds();
  const row = await env.DB.prepare(
    `SELECT couple_id FROM sessions WHERE token_hash = ? AND expires_at > ?`
  )
    .bind(tokenHash, now)
    .first<{ couple_id: string }>();
  if (!row) return null;
  // Sliding window
  await env.DB.prepare(`UPDATE sessions SET last_used_at = ? WHERE token_hash = ?`)
    .bind(now, tokenHash)
    .run();
  return { coupleId: row.couple_id };
}

export function sessionCookieHeader(token: string, isProd: boolean): string {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${SESSION_TTL_SECONDS}`];
  if (isProd) flags.push('Secure');
  return `altru_session=${token}; ${flags.join('; ')}`;
}

export function readSessionCookie(req: Request): string | null {
  const cookie = req.headers.get('Cookie') ?? '';
  for (const part of cookie.split(/;\s*/)) {
    const [k, v] = part.split('=');
    if (k === 'altru_session' && v) return v;
  }
  return null;
}
