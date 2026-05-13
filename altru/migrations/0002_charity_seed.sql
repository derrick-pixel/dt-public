-- Migration 0002: seed the three confirmed IPC partner charities.
-- Source: js/app.js IPC_CHARITIES (status: confirmed).
-- PayNow UEN assumed equal to UEN unless the charity has registered a different
-- one; verify with each charity's finance team before going live.

INSERT INTO charities
  (id, name, uen, ipc_no, paynow_uen, status, created_at, updated_at)
VALUES
  ('singapore-cancer-society', 'Singapore Cancer Society',
   'S65SS0033F', 'IPC000050', 'S65SS0033F', 'confirmed',
   strftime('%s','now'), strftime('%s','now')),

  ('spirit-of-enterprise', 'Spirit of Enterprise',
   '200301515E', 'IPC000906', '200301515E', 'confirmed',
   strftime('%s','now'), strftime('%s','now')),

  ('boys-town', 'Boys'' Town',
   'S61SS0072G', 'IPC000022', 'S61SS0072G', 'confirmed',
   strftime('%s','now'), strftime('%s','now'));
