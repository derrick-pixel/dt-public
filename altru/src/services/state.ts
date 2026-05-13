import type { ActorType, Env, GiftState } from '../types';
import { nowSeconds } from '../lib/time';
import { audit } from './audit';

// Legal gift-state transitions. Empty array = terminal state.
// Refer to /docs/transactions-and-accounts.md §5 for the diagram.
const TRANSITIONS: Record<GiftState, GiftState[]> = {
  pending_claim: ['pending', 'auto_refunded', 'refunded', 'failed', 'disputed'],
  pending:       ['authorised', 'auto_refunded', 'refunded', 'disputed'],
  authorised:    ['released', 'disputed'],
  released:      [],
  auto_refunded: [],
  refunded:      [],
  failed:        [],
  disputed:      ['pending', 'authorised', 'refunded', 'auto_refunded'],
};

export interface TransitionResult {
  ok: boolean;
  previousState?: GiftState;
  newState?: GiftState;
  reason?: string;
}

export async function transitionGiftState(
  env: Env,
  giftId: string,
  newState: GiftState,
  actor: { type: ActorType; ref?: string },
  metadata: Record<string, unknown> = {}
): Promise<TransitionResult> {
  const row = await env.DB.prepare(`SELECT state FROM gifts WHERE id = ?`)
    .bind(giftId)
    .first<{ state: GiftState }>();
  if (!row) return { ok: false, reason: 'gift_not_found' };
  // Idempotent no-op
  if (row.state === newState) return { ok: true, previousState: row.state, newState };

  const allowed = TRANSITIONS[row.state] ?? [];
  if (!allowed.includes(newState)) {
    return { ok: false, reason: `illegal_transition_${row.state}_to_${newState}` };
  }
  const now = nowSeconds();
  await env.DB.prepare(`UPDATE gifts SET state = ?, state_changed_at = ? WHERE id = ?`)
    .bind(newState, now, giftId)
    .run();
  await audit(env, {
    actorType: actor.type,
    actorRef: actor.ref,
    eventType: `gift.${newState}`,
    entityType: 'gift',
    entityId: giftId,
    payload: { previous: row.state, ...metadata },
  });
  return { ok: true, previousState: row.state, newState };
}
