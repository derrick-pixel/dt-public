-- 0018_holders_directory.sql
-- SEC-P0-1: assets/data.json was publicly fetchable with every holder's
-- name, partial NRIC, email, dept, title, grants. Closing the leak by:
--   1. Creating a holders_directory table mirroring the prior data.json
--      holders[] content
--   2. RLS so admin/committee see all rows; holders see only their own
--   3. Seeding from current data.json content
-- After this migration the static data.json must be stripped of holders/
-- leavers/valuation_history/special_dividends; the frontend fetches the
-- directory from Supabase post-authentication.

create table if not exists public.holders_directory (
  id int primary key,
  name text not null,
  dept text,
  title text,
  nat text,
  ic text,                -- masked, e.g. "XXXXX267F"
  email text,
  status text not null default 'active' check (status in ('active','leaver')),
  notes text,             -- free-text per-row note (used for leaver context)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.holders_directory enable row level security;

-- Holders see only their own row
create policy holders_directory_self_select on public.holders_directory
  for select using (
    public.profile_role() = 'holder' and
    id::text = (select holder_id from public.profiles where id = auth.uid())
  );

-- Admin/committee see all rows (so admin console can render the roster)
create policy holders_directory_staff_select on public.holders_directory
  for select using (public.profile_role() in ('admin','committee'));

-- Writes only via the add_holder / update_holder RPCs — no direct INSERT/UPDATE/DELETE
revoke all on public.holders_directory from public, anon, authenticated;
grant select on public.holders_directory to authenticated;

-- ---------- Seed from current data.json ----------------------------------
insert into public.holders_directory(id, name, dept, title, nat, ic, email, status) values
  (1,  'Tok Meiting',                'HR',    'HR Manager',                   'Singaporean', 'XXXXX267F', 'meiting@elitez.asia',     'active'),
  (2,  'Li Qian',                    'FIN',   'Senior Finance Manager',       'Singaporean', 'XXXXX139F', 'liqian@elitez.asia',      'active'),
  (3,  'Eevann Seah',                'SALES', 'Senior Manager',               'Singaporean', 'XXXXX620D', 'eevann.seah@elitez.asia', 'active'),
  (4,  'Wang Jiemin (Jack)',         'SALES', 'Associate Director',           'Singaporean', 'XXXXX978G', 'jack.wang@elitez.asia',   'active'),
  (5,  'Sharon Lau Jie Joo',         'SALES', 'Senior Manager',               'Malaysian',   'XXXXX763E', 'sharon.lau@elitez.asia',  'active'),
  (6,  'Yeoh Ser How',               'OPS',   'Operations Manager',           'Malaysian',   'XXXXX646F', 'serhow.yeoh@elitez.asia', 'active'),
  (7,  'Chan Wai Seng, Nicholas',    'SALES', 'Head of Tenders',              'Singaporean', 'XXXXX162G', 'nicholas.chan@elitez.asia', 'active'),
  (8,  'Damien Tan Han Kiap',        'SALES', 'Business Development Manager', 'Singaporean', 'XXXXX253Z', 'damien.tan@elitez.asia',  'active'),
  (9,  'Chen Ting',                  'FIN',   'Senior Finance Executive',     'Chinese',     'XXXXX645G', 'chenting@elitez.asia',    'active'),
  (10, 'Andy Lim Wen Jie',           'OPS',   'Deputy Head, ESG',             'Singaporean', 'XXXXX300D', 'andy.lim@elitez.asia',    'active'),
  (11, 'Aiydon Li Yi Xuan',          'HR',    'Team Lead',                    'Singaporean', 'XXXXX890Z', 'aiydon@elitez.asia',      'active'),
  (12, 'Wong Siew Hua',              'FIN',   'Assistant Accounts Manager',   'Malaysian',   'XXXXX768L', 'siewhwa.wong@elitez.asia', 'active'),
  (13, 'Kan Siew Weng',              'FIN',   'Senior Finance Executive',     'Malaysian',   'NEEDS RE-ENTRY', 'siewweng.kan@elitez.asia', 'active'),
  (14, 'How Hee Chek (Jaysen)',      'DHC',   'Deputy Regional Head of Sales','Singaporean', 'XXXXX770A', 'jaysen@dhc.com.sg',       'active'),
  (15, 'Lim Runting',                'DHC',   'Principal Consultant',         'Singaporean', 'XXXXX484Z', 'runting@dhc.com.sg',      'active'),
  (16, 'Ho Si Cong',                 'DHC',   'Manager',                      'Singaporean', 'XXXXX440G', 'sicong@dhc.com.sg',       'active'),
  (17, 'Tiong Kai Yuen, Noreen',     'DHC',   'Senior Researcher',            'Singaporean', 'XXXXX127B', 'noreen@dhc.com.sg',       'active'),
  (18, 'Tan Hui Qing',               'DHC',   'Operations Manager',           'Singaporean', 'XXXXX958Z', 'huiqing@dhc.com.sg',      'active'),
  (19, 'Kenneth Koh',                'OPS',   'Operations Manager',           'Singaporean', 'XXXXX246D', 'kenneth.koh@elitez.asia', 'active'),
  (20, 'Heng Zeng Yang Ian',         'SALES', 'Business Development Manager', 'Singaporean', 'XXXXX974E', 'ian.heng@elitez.asia',    'active'),
  (21, 'Tsai Pei-Hua (Penny)',       'SALES', 'Manager',                      'Taiwanese',   'XXXXX445G', 'penny.tsai@elitez.asia',  'active'),
  (22, 'Jorena Tan Chee Huan',       'SALES', 'Business Development Manager', 'Singaporean', 'XXXXX775B', 'jorena.tan@elitez.asia',  'active'),
  (24, 'Marilyn Choo Lih Cheen',     'FIN',   'Team Lead',                    'Malaysian',   'XXXXX317G', 'marilyn.choo@elitez.asia', 'active'),
  (25, 'Phua Qiu Ru',                'DHC',   'Senior Manager',               'Singaporean', 'XXXXX923H', 'qiuru@dhc.com.sg',        'active'),
  (26, 'Neo Xian Yao',               'SALES', 'Assistant BD Manager',         'Singaporean', 'XXXXX999D', 'sam.neo@elitez.asia',     'active'),
  (27, 'Tan Sheng Yang',             'FIN',   'Assistant Finance Manager',    'Singaporean', 'XXXXX893G', 'shengyang.tan@elitez.asia', 'active'),
  (28, 'Chan Huan Zhang Adrian',     'SALES', 'BD Manager',                   'Singaporean', 'XXXXX162D', 'adrian.chan@elitez.asia', 'active'),
  (32, 'Jonathan Tan',               'TEST',  'Test Holder (smoke test)',     'Singaporean', 'XXXXX567A', 'jonathan@elitez.asia',    'active')
on conflict (id) do update set
  name = excluded.name, dept = excluded.dept, title = excluded.title,
  nat = excluded.nat, ic = excluded.ic, email = excluded.email,
  status = excluded.status, updated_at = now();

-- Leavers
insert into public.holders_directory(id, name, status, notes) values
  (23,  'Melissa Tan Yi Xuan', 'leaver', 'FY2024 43,580 + FY2025 11,900 attached — leaver treatment TBD'),
  (101, 'Samion Ong',          'leaver', 'FY2022 20,000 forfeited — leaver treatment TBD'),
  (102, 'Philip Leong',        'leaver', 'FY2022 20,000 forfeited — leaver treatment TBD'),
  (103, 'Asmond Soh',          'leaver', 'FY2022 20,000 forfeited — leaver treatment TBD')
on conflict (id) do update set
  name = excluded.name, status = excluded.status, notes = excluded.notes,
  updated_at = now();
