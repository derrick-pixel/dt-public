-- Migration 0001: initial schema for Altru platform.
-- D1 / SQLite syntax. Money in cents (INTEGER). Times in unix seconds.

CREATE TABLE IF NOT EXISTS weddings (
  id            TEXT    PRIMARY KEY,
  slug          TEXT    NOT NULL UNIQUE,
  wedding_date  TEXT    NOT NULL,
  status        TEXT    NOT NULL
                CHECK (status IN ('pending_couple_claim','active','closed','past','disputed')),
  default_split_personal_pct INTEGER NOT NULL DEFAULT 0,
  created_by    TEXT    NOT NULL CHECK (created_by IN ('couple','guest')),
  created_at    INTEGER NOT NULL,
  claimed_at    INTEGER,
  closed_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_weddings_status ON weddings(status);
CREATE INDEX IF NOT EXISTS idx_weddings_date   ON weddings(wedding_date);

CREATE TABLE IF NOT EXISTS couples (
  id                   TEXT    PRIMARY KEY,
  wedding_id           TEXT    NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  display_name         TEXT    NOT NULL,
  role                 TEXT    NOT NULL CHECK (role IN ('partner1','partner2')),
  -- email is NULL for a guest-created (Path B) couple until they claim the
  -- page and supply their own address. Path A couples always have an email.
  email                TEXT,
  mobile               TEXT    NOT NULL,
  email_verified_at    INTEGER,
  mobile_verified_at   INTEGER,
  nric_encrypted       TEXT,
  nric_consented_at    INTEGER,
  iras_donor_share_pct INTEGER NOT NULL DEFAULT 100,
  created_at           INTEGER NOT NULL,
  UNIQUE(wedding_id, role)
);
CREATE INDEX IF NOT EXISTS idx_couples_email   ON couples(email);
CREATE INDEX IF NOT EXISTS idx_couples_wedding ON couples(wedding_id);

CREATE TABLE IF NOT EXISTS charities (
  id            TEXT    PRIMARY KEY,
  name          TEXT    NOT NULL,
  uen           TEXT    NOT NULL,
  ipc_no        TEXT    NOT NULL,
  paynow_uen    TEXT    NOT NULL,
  status        TEXT    NOT NULL
                CHECK (status IN ('confirmed','pending','paused','withdrawn')),
  dpo_email     TEXT,
  finance_email TEXT,
  brand_kit_url TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS wedding_charities (
  wedding_id TEXT    NOT NULL REFERENCES weddings(id)  ON DELETE CASCADE,
  charity_id TEXT    NOT NULL REFERENCES charities(id) ON DELETE RESTRICT,
  share_pct  INTEGER NOT NULL DEFAULT 100,
  added_at   INTEGER NOT NULL,
  removed_at INTEGER,
  PRIMARY KEY (wedding_id, charity_id)
);

CREATE TABLE IF NOT EXISTS gifts (
  id                       TEXT    PRIMARY KEY,
  wedding_id               TEXT    NOT NULL REFERENCES weddings(id),
  guest_name               TEXT    NOT NULL,
  guest_mobile             TEXT    NOT NULL,
  guest_email              TEXT,
  gift_amount_cents        INTEGER NOT NULL,
  personal_portion_cents   INTEGER NOT NULL,
  charity_portions_json    TEXT    NOT NULL,
  state                    TEXT    NOT NULL
                           CHECK (state IN ('pending_claim','pending','authorised',
                                            'declined','released','auto_refunded',
                                            'refunded','failed','disputed')),
  state_changed_at         INTEGER NOT NULL,
  payment_ref              TEXT,
  payment_succeeded_at     INTEGER,
  refund_ref               TEXT,
  scheduled_auto_refund_at INTEGER NOT NULL,
  message_to_couple        TEXT,
  created_at               INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gifts_wedding     ON gifts(wedding_id);
CREATE INDEX IF NOT EXISTS idx_gifts_state       ON gifts(state);
CREATE INDEX IF NOT EXISTS idx_gifts_auto_refund ON gifts(scheduled_auto_refund_at);
CREATE INDEX IF NOT EXISTS idx_gifts_payment_ref ON gifts(payment_ref);

CREATE TABLE IF NOT EXISTS disbursements (
  id                TEXT    PRIMARY KEY,
  wedding_id        TEXT    NOT NULL,
  beneficiary_type  TEXT    NOT NULL CHECK (beneficiary_type IN ('charity','couple')),
  charity_id        TEXT,
  beneficiary_uen   TEXT    NOT NULL,
  amount_cents      INTEGER NOT NULL,
  gift_ids_json     TEXT    NOT NULL,
  bank_ref          TEXT,
  status            TEXT    NOT NULL CHECK (status IN ('queued','sent','confirmed','failed')),
  queued_at         INTEGER NOT NULL,
  sent_at           INTEGER,
  confirmed_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_disbursements_wedding ON disbursements(wedding_id);
CREATE INDEX IF NOT EXISTS idx_disbursements_status  ON disbursements(status);

CREATE TABLE IF NOT EXISTS invoices (
  id                          TEXT    PRIMARY KEY,
  charity_id                  TEXT    NOT NULL REFERENCES charities(id),
  period_month                TEXT    NOT NULL,
  gift_count                  INTEGER NOT NULL,
  gross_charity_amount_cents  INTEGER NOT NULL,
  altru_fee_cents             INTEGER NOT NULL,
  pdf_r2_key                  TEXT,
  status                      TEXT    NOT NULL CHECK (status IN ('issued','paid','overdue')),
  issued_at                   INTEGER NOT NULL,
  paid_at                     INTEGER,
  UNIQUE (charity_id, period_month)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           INTEGER NOT NULL,
  actor_type   TEXT    NOT NULL
               CHECK (actor_type IN ('couple','guest','system','operator','charity')),
  actor_ref    TEXT,
  event_type   TEXT    NOT NULL,
  entity_type  TEXT    NOT NULL,
  entity_id    TEXT    NOT NULL,
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts     ON audit_log(ts);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash    TEXT    PRIMARY KEY,
  couple_id     TEXT    NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_at    INTEGER NOT NULL,
  last_used_at  INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  user_agent    TEXT,
  ip_address    TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_couple  ON sessions(couple_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS otp_codes (
  code_hash     TEXT    PRIMARY KEY,
  purpose       TEXT    NOT NULL CHECK (purpose IN
                ('magic_link','mobile_verify','authorise_action','claim_link')),
  subject_type  TEXT    NOT NULL,
  subject_ref   TEXT    NOT NULL,
  created_at    INTEGER NOT NULL,
  expires_at    INTEGER NOT NULL,
  consumed_at   INTEGER,
  attempts      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_subject ON otp_codes(subject_type, subject_ref);

CREATE TABLE IF NOT EXISTS sanctions_checks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type   TEXT    NOT NULL,
  entity_id     TEXT    NOT NULL,
  name_checked  TEXT    NOT NULL,
  list_version  TEXT    NOT NULL,
  result        TEXT    NOT NULL CHECK (result IN ('pass','review','fail')),
  checked_at    INTEGER NOT NULL,
  payload_json  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sanctions_entity ON sanctions_checks(entity_type, entity_id);
