-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Dormitories (top 20 Singapore worker dormitories)
create table dormitories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  delivery_day text not null default 'Saturday',
  is_active boolean not null default true
);

-- Seed top 20 Singapore dormitories
insert into dormitories (name, address, delivery_day) values
  ('Tuas South Dormitory', '30 Tuas South Ave 14, Singapore 637212', 'Saturday'),
  ('Westlite Tuas Dormitory', '30 Tuas Crescent, Singapore 638720', 'Saturday'),
  ('Avery Lodge', '35 Kian Teck Drive, Singapore 628841', 'Saturday'),
  ('Papillon Lodge', '9 Chin Bee Drive, Singapore 619862', 'Saturday'),
  ('Mandai Lodge', '151 Mandai Estate, Singapore 729932', 'Sunday'),
  ('Westlite Juniper', '10 Juniper Crescent, Singapore 648341', 'Sunday'),
  ('Tuas View Dormitory', '85 Tuas View Loop, Singapore 637064', 'Saturday'),
  ('Kranji Lodge 1', '11 Neo Tiew Lane 2, Singapore 718811', 'Sunday'),
  ('Kranji Lodge 2', '10 Neo Tiew Lane 2, Singapore 718812', 'Sunday'),
  ('Cochrane Lodge 1', '9 Admiralty Street, Singapore 757717', 'Saturday'),
  ('Cochrane Lodge 2', '8 Admiralty Street, Singapore 757718', 'Saturday'),
  ('Pioneer Lodge', '1 Jurong West St 93, Singapore 649555', 'Sunday'),
  ('Juniper Lodge', '12 Juniper Crescent, Singapore 648342', 'Sunday'),
  ('Centurion BSL Dormitory', '2 Buroh Street, Singapore 618540', 'Saturday'),
  ('Giant Dormitory (Canberra)', '18 Canberra Drive, Singapore 768445', 'Sunday'),
  ('Sungei Tengah Lodge', '500 Old Choa Chu Kang Rd, Singapore 698918', 'Sunday'),
  ('Woodlands Dormitory', '2 Woodlands Sector 1, Singapore 738068', 'Sunday'),
  ('Punggol Dormitory', '90 Punggol Field, Singapore 828812', 'Saturday'),
  ('Sembawang Lodge', '10 Admiralty Road West, Singapore 759452', 'Sunday'),
  ('International Plaza Dormitory', '10 Anson Rd, Singapore 079903', 'Saturday');

-- Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  image_url text,
  category text not null check (category in (
    -- Legacy grocery categories (kept so the OOS page can still query the old SKUs)
    'beverages', 'snacks', 'instant_noodles', 'canned_goods',
    'rice_grains', 'cooking_essentials', 'personal_care', 'dairy', 'other',
    -- GSK / pharma catalogue categories
    'pain_relief', 'oral_care', 'denture_care',
    'vitamins', 'supplements', 'cold_flu', 'skincare', 'digestive'
  )),
  original_price numeric(10,2) not null,
  sale_price numeric(10,2) not null,
  discount_pct integer not null,
  expiry_date date not null,
  stock_qty integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  full_name text,
  dormitory_id uuid references dormitories(id),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),
  dormitory_id uuid not null references dormitories(id),
  status text not null default 'pending_payment' check (status in (
    'pending_payment', 'paid', 'processing', 'out_for_delivery', 'delivered', 'cancelled'
  )),
  total_amount numeric(10,2) not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_ref text,            -- PayNow reference: LASTNAME POSTALCODE
  postal_code text not null default '',
  week_cutoff date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Order items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null
);

-- RLS policies
alter table dormitories enable row level security;
alter table products enable row level security;
alter table users enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Dormitories: public read
create policy "Dormitories are publicly readable" on dormitories
  for select using (true);

-- Products: public read of active products
create policy "Active products are publicly readable" on products
  for select using (is_active = true);

create policy "Admins can manage products" on products
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Users: own record only
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on users
  for insert with check (auth.uid() = id);

create policy "Admins can view all users" on users
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Orders: own orders
create policy "Users can view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users can create own orders" on orders
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all orders" on orders
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Order items: via order ownership
create policy "Users can view own order items" on order_items
  for select using (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Users can insert own order items" on order_items
  for insert with check (
    exists (select 1 from orders where id = order_id and user_id = auth.uid())
  );

create policy "Admins can manage all order items" on order_items
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
