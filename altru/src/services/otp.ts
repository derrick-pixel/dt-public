import type { Env } from '../types';
import { sha256Hex } from '../lib/sha256';
import { nowSeconds } from '../lib/time';

export type OtpPurpose = 'mobile_verify' | 'authorise_action' | 'claim_link';

const OTP_TTL_SECONDS = 10 * 60;
const MAX_ATTEMPTS = 5;

export async function issueOtp(
  env: Env,
  purpose: OtpPurpose,
  subjectType: string,
  subjectRef: string
): Promise<{ code: string }> {
  const buf = crypto.getRandomValues(new Uint32Array(1));
  const code = (buf[0] % 1_000_000).toString().padStart(6, '0');
  const codeHash = await sha256Hex(code);
  const now = nowSeconds();
  await env.DB.prepare(
    `INSERT INTO otp_codes (code_hash, purpose, subject_type, subject_ref, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(codeHash, purpose, subjectType, subjectRef, now, now + OTP_TTL_SECONDS)
    .run();
  return { code };
}

export async function verifyOtp(
  env: Env,
  purpose: OtpPurpose,
  subjectType: string,
  subjectRef: string,
  code: string
): Promise<boolean> {
  const codeHash = await sha256Hex(code);
  const now = nowSeconds();

  // Rate-limit: count attempts across all unconsumed OTPs for this subject
  const total = await env.DB.prepare(
    `SELECT COALESCE(SUM(attempts), 0) AS s FROM otp_codes
     WHERE purpose = ? AND subject_type = ? AND subject_ref = ?
       AND consumed_at IS NULL AND expires_at > ?`
  )
    .bind(purpose, subjectType, subjectRef, now)
    .first<{ s: number }>();
  if ((total?.s ?? 0) >= MAX_ATTEMPTS) return false;

  const row = await env.DB.prepare(
    `SELECT code_hash FROM otp_codes
     WHERE code_hash = ? AND purpose = ? AND subject_type = ? AND subject_ref = ?
       AND expires_at > ? AND consumed_at IS NULL`
  )
    .bind(codeHash, purpose, subjectType, subjectRef, now)
    .first<{ code_hash: string }>();

  if (!row) {
    // Wrong code — bump attempts on every unconsumed candidate for this subject
    await env.DB.prepare(
      `UPDATE otp_codes SET attempts = attempts + 1
       WHERE purpose = ? AND subject_type = ? AND subject_ref = ?
         AND consumed_at IS NULL AND expires_at > ?`
    )
      .bind(purpose, subjectType, subjectRef, now)
      .run();
    return false;
  }

  await env.DB.prepare(`UPDATE otp_codes SET consumed_at = ? WHERE code_hash = ?`)
    .bind(now, row.code_hash)
    .run();
  return true;
}
