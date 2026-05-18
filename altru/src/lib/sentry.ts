import type { Env } from '../types';

// ── Sentry error capture ──────────────────────────────────────────────────
// Minimal, dependency-free. Sends a Sentry envelope when SENTRY_DSN is set;
// otherwise falls back to console.error (picked up by Cloudflare observability).
// Never throws — error reporting must not break the request path.

function hex32(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

export async function captureException(
  env: Env,
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  const dsn = env.SENTRY_DSN;
  if (!dsn) {
    console.error('[error]', err.message, context);
    return;
  }
  try {
    const u = new URL(dsn);
    const key = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!key || !projectId) {
      console.error('[error]', err.message, context);
      return;
    }
    const endpoint = `${u.protocol}//${u.host}/api/${projectId}/envelope/`;
    const eventId = hex32();
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: 'error',
      logger: 'altru-worker',
      environment: env.ENV,
      exception: { values: [{ type: err.name, value: err.message }] },
      extra: { ...context, stack: err.stack ?? null },
    };
    const body =
      JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() }) +
      '\n' +
      JSON.stringify({ type: 'event' }) +
      '\n' +
      JSON.stringify(event);
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}, sentry_client=altru-worker/1.0`,
      },
      body,
    });
  } catch (e) {
    console.error('[error] (sentry delivery failed)', err.message, e);
  }
}
