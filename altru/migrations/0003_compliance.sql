-- Migration 0003: Compliance tables
-- Covers: PDPA consent logging, Charities Act PFA tracking,
-- data-subject request handling, AI operations task queue,
-- and regulatory update log.
-- All timestamps are Unix seconds.

-- ── PDPA Consent Log ─────────────────────────────────────────────────────
-- One row per explicit consent event (collection, marketing, NRIC, etc.)
-- Required by PDPA to evidence that consent was obtained.
CREATE TABLE IF NOT EXISTS consent_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,
  subject_type TEXT    NOT NULL CHECK (subject_type IN ('couple','guest')),
  subject_ref  TEXT    NOT NULL,  -- couple_id or guest identifier
  purpose      TEXT    NOT NULL
               CHECK (purpose IN (
                 'data_collection',     -- basic name/email/mobile
                 'nric_collection',     -- NRIC for IRAS tax receipt
                 'marketing',           -- future marketing comms
                 'third_party_share'    -- sharing with charity for tax receipt
               )),
  action       TEXT    NOT NULL CHECK (action IN ('granted','withdrawn')),
  channel      TEXT    NOT NULL CHECK (channel IN ('web_ui','api','email','admin')),
  ip_address   TEXT,
  user_agent   TEXT
);
CREATE INDEX IF NOT EXISTS idx_consent_subject ON consent_logs(subject_type, subject_ref);
CREATE INDEX IF NOT EXISTS idx_consent_ts      ON consent_logs(ts);

-- ── Charities Act: PFA Agreements ────────────────────────────────────────
-- Track the written fund-raising agreement with each partner charity.
-- Required by Charities Act s.41: agreement must be signed BEFORE
-- any fund-raising appeal. Disbursements are blocked if pfa_status != 'active'.
CREATE TABLE IF NOT EXISTS pfa_agreements (
  id               TEXT    PRIMARY KEY,
  charity_id       TEXT    NOT NULL REFERENCES charities(id) ON DELETE RESTRICT,
  status           TEXT    NOT NULL
                   CHECK (status IN ('draft','signed','expired','terminated')),
  effective_date   TEXT    NOT NULL,  -- ISO 8601
  expiry_date      TEXT,              -- NULL = no fixed expiry
  signed_at        INTEGER,           -- unix seconds
  document_r2_key  TEXT,              -- signed PDF stored in R2
  fee_bps          INTEGER NOT NULL DEFAULT 500,  -- platform fee in basis points
  notes            TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pfa_charity ON pfa_agreements(charity_id, status);

-- ── Charities Act: Fundraising Permits ────────────────────────────────────
-- Track COC fundraising permit applications and status.
-- Required at least 30 days before each fundraising appeal.
CREATE TABLE IF NOT EXISTS fundraising_permits (
  id              TEXT    PRIMARY KEY,
  permit_ref      TEXT,               -- COC reference number once issued
  status          TEXT    NOT NULL
                  CHECK (status IN ('pending_application','applied','issued','expired','not_required')),
  appeal_type     TEXT    NOT NULL,   -- e.g. 'online_platform', 'event'
  appeal_start    TEXT,               -- ISO 8601
  appeal_end      TEXT,               -- ISO 8601
  applied_at      INTEGER,
  issued_at       INTEGER,
  expires_at      INTEGER,
  document_r2_key TEXT,
  notes           TEXT,
  created_at      INTEGER NOT NULL
);

-- ── PDPA: Data Subject Requests ──────────────────────────────────────────
-- Track access, correction, and deletion requests.
-- Must be responded to within 30 days (access/correction) under PDPA.
-- Deletion within a reasonable period.
CREATE TABLE IF NOT EXISTS data_subject_requests (
  id             TEXT    PRIMARY KEY,
  ts             INTEGER NOT NULL,
  subject_type   TEXT    NOT NULL CHECK (subject_type IN ('couple','guest','other')),
  subject_ref    TEXT,
  contact_email  TEXT    NOT NULL,
  request_type   TEXT    NOT NULL
                 CHECK (request_type IN ('access','correction','deletion','withdraw_consent','portability')),
  status         TEXT    NOT NULL
                 CHECK (status IN ('received','in_review','completed','rejected','escalated')),
  deadline_at    INTEGER NOT NULL,   -- ts + 30 days for access/correction
  completed_at   INTEGER,
  operator_notes TEXT,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON data_subject_requests(status, deadline_at);

-- ── AI Operations Task Queue ─────────────────────────────────────────────
-- Tasks generated or completed by AI agents (Claude API).
-- Used for audit trail and operator oversight.
-- Operator can review AI outputs before they are actioned externally.
CREATE TABLE IF NOT EXISTS ai_tasks (
  id             TEXT    PRIMARY KEY,
  ts             INTEGER NOT NULL,
  task_type      TEXT    NOT NULL
                 CHECK (task_type IN (
                   'compliance_review',       -- weekly transaction compliance scan
                   'invoice_draft',           -- draft monthly charity invoice
                   'soa_draft',               -- draft Statement of Accounts
                   'sanctions_refresh',       -- MAS sanctions list update
                   'regulatory_update_scan',  -- scan for regulatory changes
                   'reconciliation_report',   -- daily HitPay reconciliation
                   'support_draft',           -- draft response to donor/couple query
                   'charity_onboarding',      -- draft PFA checklist for new charity
                   'breach_assessment'        -- assess potential data breach
                 )),
  status         TEXT    NOT NULL
                 CHECK (status IN ('pending','running','awaiting_review','approved','actioned','failed')),
  input_json     TEXT,               -- task input context
  output_json    TEXT,               -- AI-generated output
  model_used     TEXT,               -- e.g. 'claude-haiku-4-5'
  tokens_used    INTEGER,
  operator_notes TEXT,               -- operator review notes
  approved_by    TEXT,               -- operator ref if approved
  actioned_at    INTEGER,
  created_at     INTEGER NOT NULL,
  completed_at   INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_tasks(status, task_type);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_ts     ON ai_tasks(ts);

-- ── Regulatory Update Log ─────────────────────────────────────────────────
-- AI agent monitors MAS, IRAS, COC websites for regulatory changes.
-- Each detected change is stored here for operator review.
CREATE TABLE IF NOT EXISTS regulatory_updates (
  id          TEXT    PRIMARY KEY,
  detected_at INTEGER NOT NULL,
  source      TEXT    NOT NULL,   -- 'MAS', 'IRAS', 'COC', 'ACRA', 'PDPC'
  url         TEXT,
  summary     TEXT    NOT NULL,   -- AI-generated plain-language summary
  impact      TEXT    NOT NULL
              CHECK (impact IN ('high','medium','low','informational')),
  status      TEXT    NOT NULL
              CHECK (status IN ('new','reviewed','actioned','dismissed')),
  reviewed_at INTEGER,
  notes       TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reg_updates_status ON regulatory_updates(status, impact);
