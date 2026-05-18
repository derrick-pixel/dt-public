-- 0016_drop_payment_reference_unique.sql
--
-- The original EXR-YYYY-NNNNN reference was guaranteed unique by the
-- pg_advisory_xact_lock + sequence pattern, so payments.reference had a
-- UNIQUE constraint as a defence-in-depth check.
--
-- Migration 0014 switched to a client-computed reference of the form
-- "<first 6 name letters><last 3 NRIC digits>" e.g. "TOKMEI267". Same
-- holder doing two exercises (in the same year or across years) will
-- intentionally produce the same reference; bank-statement reconciliation
-- distinguishes by amount + date.
--
-- Drop the now-incompatible UNIQUE constraint. payments.id (uuid PK) is
-- still the row identifier; reference is purely informational.

alter table public.payments drop constraint if exists payments_reference_key;

-- Useful non-unique index so admin/committee reconciliation queries
-- ("show all payments with reference JONATH567") stay fast.
create index if not exists payments_reference_idx on public.payments (reference);
