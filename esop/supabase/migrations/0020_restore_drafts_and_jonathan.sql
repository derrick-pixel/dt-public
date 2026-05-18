-- 0020_restore_drafts_and_jonathan.sql
-- After stripping holders[] from data.json (0018), the per-holder FY2025
-- draft allocations and Jonathan's manually-seeded FY2022 grant were no
-- longer rendered in the frontend (they came from data.json, not from
-- events). Backfilling as events here so admin / portal views reconstruct
-- the same totals authoritatively from the event store.
--
-- Inserted directly with a known seed-style id (no hash chain extension
-- needed for replay-only seeds; the verify_chain RPC tolerates NULL
-- digest_input by falling back to the legacy formula).

-- ----- FY2025 drafts ------------------------------------------------------
-- 27 draft allocations from the pre-strip data.json. Emitted as
-- allocation_changed which the store reducer interprets as adding a draft
-- grant row to the holder.
insert into public.events(id, type, payload, at, actor_role, prev_hash, hash)
select
  'ev_seed_alloc_' || lpad(holder_id::text, 3, '0') || '_fy2025',
  'allocation_changed',
  jsonb_build_object(
    'holder_id', holder_id::text,
    'fy', 'FY2025',
    'qty', qty,
    'status', 'draft',
    'scenario_name', 'FY2025 baseline (restored from 2026-05-16 strip)'
  ),
  '2026-05-16 12:00:00+00'::timestamptz,
  'admin',
  null,
  encode(digest(holder_id::text || ':' || qty::text || ':alloc_seed', 'sha256'), 'hex')
from (values
  (1, 40400), (2, 40400), (3, 39200), (4, 42700), (5, 9700),
  (6, 9700), (7, 18500), (8, 17100), (9, 13700), (10, 15000),
  (11, 13700), (12, 28700), (13, 15000), (14, 15000), (15, 11300),
  (16, 8200), (17, 7300), (18, 23300), (19, 2300), (20, 18500),
  (21, 11900), (22, 11900), (24, 35900), (25, 15000), (26, 20100),
  (27, 28700), (28, 10200)
) as t(holder_id, qty)
on conflict (id) do nothing;

-- ----- Jonathan Tan FY2022 grant (test holder, id=32) --------------------
-- Backdated grant for smoke-testing the exercise flow. Window opens
-- 2026-05-01 (14-day) — admin sets demo-date inside that window.
insert into public.events(id, type, payload, at, actor_role, prev_hash, hash)
values (
  'ev_seed_grant_jonathan_fy2022',
  'grant_approved',
  jsonb_build_object(
    'holder_id', '32',
    'fy', 'FY2022',
    'grant_date', '2021-05-01',
    'letter_date', '2021-05-01',
    'qty', 10000,
    'note', 'Test holder — Jonathan Tan smoke-test grant'
  ),
  '2026-05-16 12:01:00+00'::timestamptz,
  'admin',
  null,
  encode(digest('jonathan:fy2022:10000', 'sha256'), 'hex')
)
on conflict (id) do nothing;
