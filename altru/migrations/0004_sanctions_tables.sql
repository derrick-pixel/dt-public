-- Migration 0004: Sanctions list storage tables
-- Required by the live MAS sanctions list refresh cron (src/services/sanctions.ts)

CREATE TABLE IF NOT EXISTS sanctions_list_meta (
  version    TEXT    PRIMARY KEY,
  fetched_at INTEGER NOT NULL,
  count      INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sanctions_names (
  list_version    TEXT NOT NULL REFERENCES sanctions_list_meta(version),
  name_normalised TEXT NOT NULL,
  PRIMARY KEY (list_version, name_normalised)
);
CREATE INDEX IF NOT EXISTS idx_sanctions_names_version ON sanctions_names(list_version);
