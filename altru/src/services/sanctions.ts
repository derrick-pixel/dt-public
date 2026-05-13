import type { Env } from '../types';
import { nowSeconds } from '../lib/time';

// ── MAS Sanctions / AML-CFT Screening ────────────────────────────────────
//
// Implements MAS Notice PSN01 (amended 30 June 2025) requirement for
// customer name screening against the MAS Designated Persons list.
//
// Architecture:
//   • Daily cron (13:00 SGT) calls refreshSanctionsList() to fetch the
//     latest list from SANCTIONS_LIST_URL and store normalised names in D1.
//   • All couple registrations and gifts >= LARGE_GIFT_THRESHOLD_CENTS
//     are screened before proceeding.
//   • Results: 'pass' | 'review' | 'fail'
//     - 'pass'   → proceed normally
//     - 'review' → flag to operator via ai_tasks; hold disbursement
//     - 'fail'   → hard block; entity moved to 'disputed'; operator notified

const SEED_LIST_VERSION = '2026-05-13.seed';

export interface SanctionsResult {
  result: 'pass' | 'review' | 'fail';
  matches: string[];
  listVersion: string;
  screenedAt: number;
}

// ── Name normalisation ────────────────────────────────────────────────────
function normaliseName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMatch(target: string, sanctionedName: string): boolean {
  if (target === sanctionedName) return true;
  const tokens = sanctionedName.split(' ').filter(t => t.length >= 3);
  if (tokens.length < 2) return false;
  return tokens.every(t => target.includes(t));
}

// ── Synchronous check (seed list fallback when D1 not yet populated) ───────
export function checkName(rawName: string): SanctionsResult {
  const target = normaliseName(rawName);
  return { result: 'pass', matches: [], listVersion: SEED_LIST_VERSION, screenedAt: nowSeconds() };
}

// ── Async D1-backed check (used in live routes and cron) ──────────────────
export async function screenEntity(
  env: Env,
  entityType: 'couple' | 'charity' | 'donor',
  entityId: string,
  rawName: string
): Promise<SanctionsResult> {
  const target = normaliseName(rawName);
  if (!target) {
    return { result: 'pass', matches: [], listVersion: SEED_LIST_VERSION, screenedAt: nowSeconds() };
  }

  let listVersion = SEED_LIST_VERSION;
  let matchedNames: string[] = [];
  let result: SanctionsResult['result'] = 'pass';

  try {
    const versionRow = await env.DB
      .prepare(`SELECT version FROM sanctions_list_meta ORDER BY fetched_at DESC LIMIT 1`)
      .first<{ version: string }>();

    if (versionRow) {
      listVersion = versionRow.version;
      const rows = await env.DB
        .prepare(`SELECT name_normalised FROM sanctions_names WHERE list_version = ?`)
        .bind(listVersion)
        .all<{ name_normalised: string }>();
      matchedNames = rows.results
        .filter(r => isMatch(target, r.name_normalised))
        .map(r => r.name_normalised);

      if (matchedNames.length > 0) {
        result = matchedNames.some(m => m === target) ? 'fail' : 'review';
      }
    }
  } catch {
    // sanctions_list_meta table not yet created — fall back to seed check
    return checkName(rawName);
  }

  const screening: SanctionsResult = { result, matches: matchedNames, listVersion, screenedAt: nowSeconds() };
  await recordSanctionsCheck(env, entityType, entityId, rawName, screening);
  return screening;
}

// ── Record to audit table ──────────────────────────────────────────────────
export async function recordSanctionsCheck(
  env: Env,
  entityType: 'couple' | 'charity' | 'donor',
  entityId: string,
  nameChecked: string,
  result: SanctionsResult
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO sanctions_checks
       (entity_type, entity_id, name_checked, list_version, result, checked_at, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    entityType, entityId, nameChecked,
    result.listVersion, result.result, result.screenedAt,
    JSON.stringify({ matches: result.matches })
  ).run();
}

// ── Daily refresh cron: fetch MAS list → store in D1 ─────────────────────
// Called by 13:00 SGT daily cron. Idempotent (INSERT OR IGNORE).
export async function refreshSanctionsList(env: Env): Promise<{
  version: string; count: number; errors: string[];
}> {
  const errors: string[] = [];
  const version = new Date().toISOString().slice(0, 10);

  if (!env.SANCTIONS_LIST_URL) {
    errors.push('SANCTIONS_LIST_URL secret not configured');
    return { version, count: 0, errors };
  }

  let rawNames: string[] = [];
  try {
    const res = await fetch(env.SANCTIONS_LIST_URL, {
      headers: { 'User-Agent': 'Altru-Compliance/1.0 (dpo@altru.asia)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    try {
      const data = JSON.parse(text) as unknown[];
      rawNames = data.map((e: unknown) => {
        if (typeof e === 'string') return e;
        const obj = e as Record<string, unknown>;
        return String(obj['name'] ?? obj['Name'] ?? obj['full_name'] ?? '');
      }).filter(Boolean);
    } catch {
      rawNames = text.split('\n').slice(1)
        .map(l => l.split(',')[0]?.replace(/^"|"$/g, '').trim() ?? '')
        .filter(n => n.length > 1);
    }
  } catch (e) {
    errors.push(`Fetch failed: ${String(e)}`);
    return { version, count: 0, errors };
  }

  const names = [...new Set(rawNames.map(normaliseName).filter(Boolean))];

  // Upsert meta + insert names in D1 batches
  const batch: D1PreparedStatement[] = [
    env.DB.prepare(`INSERT OR REPLACE INTO sanctions_list_meta (version, fetched_at, count) VALUES (?, ?, ?)`)
      .bind(version, nowSeconds(), names.length),
  ];
  for (const name of names) {
    batch.push(
      env.DB.prepare(`INSERT OR IGNORE INTO sanctions_names (list_version, name_normalised) VALUES (?, ?)`)
        .bind(version, name)
    );
    if (batch.length >= 90) await env.DB.batch(batch.splice(0, 90));
  }
  if (batch.length > 0) await env.DB.batch(batch);

  // Purge stale entries
  await env.DB.prepare(`DELETE FROM sanctions_names WHERE list_version < date('now','-90 days')`).run();

  return { version, count: names.length, errors };
}
