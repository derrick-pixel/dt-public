import type { Env } from '../types';
import { generateId } from '../lib/id';
import { nowSeconds } from '../lib/time';
import { transitionGiftState } from '../services/state';
import { audit } from '../services/audit';

// ── Disbursement cron ─────────────────────────────────────────────────────
// Runs daily ("0 1 * * *"). Batches settled gifts into queued disbursements,
// grouped by wedding, then transitions them → released:
//
//   authorised → couple approved: charity disbursement(s) + couple disbursement.
//   declined   → couple declined: couple disbursement only (the charity
//                portion was already refunded to the guest at decline time).
//
// The actual PayNow/bank transfers are executed by the operator, who marks
// each disbursement sent → confirmed via the admin endpoints.
//
// Paid-in-gross: a charity disbursement is the FULL charity portion. The 5%
// platform fee is invoiced to the charity separately (see cron/invoices.ts).

interface AuthorisedGift {
  id: string;
  wedding_id: string;
  state: string;
  personal_portion_cents: number;
  charity_portions_json: string;
}

interface CharityBucket {
  amount: number;
  giftIds: Set<string>;
}

interface WeddingBucket {
  couplePersonal: number;
  coupleGiftIds: Set<string>;
  charities: Map<string, CharityBucket>;
  allGiftIds: Set<string>;
}

const BATCH_LIMIT = 1000;

export async function runDisbursement(env: Env): Promise<void> {
  const gifts = (
    await env.DB.prepare(
      `SELECT g.id, g.wedding_id, g.state, g.personal_portion_cents, g.charity_portions_json
       FROM gifts g JOIN weddings w ON w.id = g.wedding_id
       WHERE g.state IN ('authorised', 'declined') AND w.status != 'disputed'
       ORDER BY g.state_changed_at ASC LIMIT ?`
    )
      .bind(BATCH_LIMIT)
      .all<AuthorisedGift>()
  ).results;
  if (gifts.length === 0) return;

  const byWedding = new Map<string, WeddingBucket>();
  for (const g of gifts) {
    let b = byWedding.get(g.wedding_id);
    if (!b) {
      b = { couplePersonal: 0, coupleGiftIds: new Set(), charities: new Map(), allGiftIds: new Set() };
      byWedding.set(g.wedding_id, b);
    }
    b.allGiftIds.add(g.id);
    if (g.personal_portion_cents > 0) {
      b.couplePersonal += g.personal_portion_cents;
      b.coupleGiftIds.add(g.id);
    }
    // A declined gift's charity portion was already refunded to the guest —
    // only the couple's personal portion is disbursed.
    if (g.state === 'declined') continue;

    let portions: { charity_id?: string; amount_cents?: number }[] = [];
    try {
      portions = JSON.parse(g.charity_portions_json) || [];
    } catch {
      portions = [];
    }
    for (const p of portions) {
      if (!p || !p.charity_id || !(typeof p.amount_cents === 'number' && p.amount_cents > 0)) continue;
      let c = b.charities.get(p.charity_id);
      if (!c) {
        c = { amount: 0, giftIds: new Set() };
        b.charities.set(p.charity_id, c);
      }
      c.amount += p.amount_cents;
      c.giftIds.add(g.id);
    }
  }

  // Resolve payout targets: charity PayNow UEN; couple PayNow-by-mobile.
  const charityIds = new Set<string>();
  byWedding.forEach((b) => b.charities.forEach((_v, k) => charityIds.add(k)));
  const charityUen = new Map<string, string>();
  if (charityIds.size > 0) {
    const ids = Array.from(charityIds);
    const ph = ids.map(() => '?').join(',');
    const rows = (
      await env.DB.prepare(`SELECT id, paynow_uen FROM charities WHERE id IN (${ph})`)
        .bind(...ids)
        .all<{ id: string; paynow_uen: string }>()
    ).results;
    rows.forEach((r) => charityUen.set(r.id, r.paynow_uen));
  }

  const weddingIds = Array.from(byWedding.keys());
  const coupleMobile = new Map<string, string>();
  {
    const ph = weddingIds.map(() => '?').join(',');
    const rows = (
      await env.DB.prepare(
        `SELECT wedding_id, mobile FROM couples WHERE role = 'partner1' AND wedding_id IN (${ph})`
      )
        .bind(...weddingIds)
        .all<{ wedding_id: string; mobile: string }>()
    ).results;
    rows.forEach((r) => coupleMobile.set(r.wedding_id, r.mobile));
  }

  const now = nowSeconds();
  const inserts: D1PreparedStatement[] = [];
  const releasedGiftIds = new Set<string>();
  let disbursementCount = 0;

  byWedding.forEach((b, weddingId) => {
    b.allGiftIds.forEach((id) => releasedGiftIds.add(id));

    if (b.couplePersonal > 0) {
      const uen = coupleMobile.get(weddingId);
      if (uen) {
        inserts.push(
          env.DB.prepare(
            `INSERT INTO disbursements
               (id, wedding_id, beneficiary_type, charity_id, beneficiary_uen,
                amount_cents, gift_ids_json, status, queued_at)
             VALUES (?, ?, 'couple', NULL, ?, ?, ?, 'queued', ?)`
          ).bind(
            generateId(),
            weddingId,
            uen,
            b.couplePersonal,
            JSON.stringify(Array.from(b.coupleGiftIds)),
            now
          )
        );
        disbursementCount++;
      }
    }

    b.charities.forEach((c, charityId) => {
      if (c.amount <= 0) return;
      const uen = charityUen.get(charityId);
      if (!uen) return;
      inserts.push(
        env.DB.prepare(
          `INSERT INTO disbursements
             (id, wedding_id, beneficiary_type, charity_id, beneficiary_uen,
              amount_cents, gift_ids_json, status, queued_at)
           VALUES (?, ?, 'charity', ?, ?, ?, ?, 'queued', ?)`
        ).bind(
          generateId(),
          weddingId,
          charityId,
          uen,
          c.amount,
          JSON.stringify(Array.from(c.giftIds)),
          now
        )
      );
      disbursementCount++;
    });
  });

  if (inserts.length > 0) await env.DB.batch(inserts);

  let released = 0;
  for (const id of releasedGiftIds) {
    const t = await transitionGiftState(env, id, 'released', { type: 'system' }, { method: 'disbursement_cron' });
    if (t.ok) released++;
  }

  await audit(env, {
    actorType: 'system',
    eventType: 'cron.disbursement.completed',
    entityType: 'system',
    entityId: 'disbursement',
    payload: { weddings: byWedding.size, disbursements: disbursementCount, gifts_released: released },
  });
}
