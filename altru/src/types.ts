export interface Env {
  // Bindings
  ASSETS: Fetcher;
  DB: D1Database;

  // Secrets (set via `wrangler secret put`)
  RESEND_API_KEY: string;
  HITPAY_API_KEY: string;
  HITPAY_WEBHOOK_SECRET: string;
  NRIC_ENCRYPTION_KEY: string;
  SESSION_HMAC_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_FROM_NUMBER: string;

  // AI Operations — Claude API (used by compliance cron agents)
  CLAUDE_API_KEY: string;

  // Compliance secrets
  SANCTIONS_LIST_URL: string;    // MAS-published designated-persons list endpoint
  OPERATOR_NOTIFY_EMAIL: string; // Where compliance alerts and AI task reviews go

  // Public env vars
  ENV: 'prod' | 'staging' | 'dev';
  PUBLIC_BASE_URL: string;
  LARGE_GIFT_THRESHOLD_CENTS: string;
  AUTO_REFUND_WINDOW_DAYS: string;
  PLATFORM_FEE_BPS: string;

  // Compliance env vars (public — safe to expose in wrangler.jsonc)
  DPO_EMAIL: string;             // dpo@altru.asia — disclosed on privacy page
  PSA_LICENCE_STATUS: string;    // 'exempt' | 'spi_licensed' | 'pending_legal_opinion'
  AI_OPS_ENABLED: string;        // 'true' | 'false' — gates Claude API calls in crons
}

export type GiftState =
  | 'pending_claim'
  | 'pending'
  | 'authorised'
  | 'released'
  | 'auto_refunded'
  | 'refunded'
  | 'failed'
  | 'disputed';

export type WeddingStatus =
  | 'pending_couple_claim'
  | 'active'
  | 'closed'
  | 'past'
  | 'disputed';

export type ActorType = 'couple' | 'guest' | 'system' | 'operator' | 'charity';

export interface CharityPortion {
  charity_id: string;
  amount_cents: number;
}
