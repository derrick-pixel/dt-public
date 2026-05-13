import type { ActorType, Env } from '../types';
import { nowSeconds } from '../lib/time';

export interface AuditEntry {
  actorType: ActorType;
  actorRef?: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload?: Record<string, unknown>;
}

export async function audit(env: Env, e: AuditEntry): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO audit_log (ts, actor_type, actor_ref, event_type, entity_type, entity_id, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      nowSeconds(),
      e.actorType,
      e.actorRef ?? null,
      e.eventType,
      e.entityType,
      e.entityId,
      e.payload ? JSON.stringify(e.payload) : null
    )
    .run();
}
