-- =============================================
-- StockAR — Database Schema
-- Paste this in Supabase SQL Editor and run it
-- =============================================

-- ── 1. Users ──────────────────────────────────

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ── 2. User Preferences ──────────────────────

create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade unique not null,
  currency_display text default 'USD' not null,
  dollar_type text default 'mep' not null,
  theme text default 'dark' not null,
  portfolio_columns jsonb default '["ticker","type","shares","price","value","dayChange","pnlPercent","weight"]'::jsonb,
  dashboard_widgets jsonb,
  alert_email text,
  weekly_summary_enabled boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ── 3. Holdings ──────────────────────────────

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  ticker text not null,
  type text not null check (type in ('stock', 'cedear')),
  total_shares numeric default 0 not null,
  avg_cost_usd numeric default 0 not null,
  total_invested_usd numeric default 0 not null,
  realized_pnl_usd numeric default 0 not null,
  total_dividends_usd numeric default 0 not null,
  cedear_ratio text,
  first_buy_date timestamptz,
  last_transaction_date timestamptz,
  transaction_count integer default 0,
  notes text,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ── 4. Transactions ──────────────────────────

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  holding_id uuid references public.holdings(id) on delete cascade not null,
  ticker text not null,
  type text not null check (type in ('stock', 'cedear')),
  action text not null check (action in ('buy', 'sell')),
  shares numeric not null,
  price_per_share numeric not null,
  price_usd numeric not null,
  currency text not null check (currency in ('USD', 'ARS')),
  exchange_rate numeric,
  total_amount numeric not null,
  total_amount_usd numeric not null,
  commission numeric,
  date timestamptz not null,
  notes text,
  created_at timestamptz default now() not null
);

-- ── 5. Dividends ─────────────────────────────

create table public.dividends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  holding_id uuid references public.holdings(id) on delete cascade not null,
  ticker text not null,
  amount_per_share numeric not null,
  total_shares_at_date numeric not null,
  total_amount numeric not null,
  total_amount_usd numeric not null,
  currency text not null check (currency in ('USD', 'ARS')),
  exchange_rate numeric,
  ex_dividend_date timestamptz,
  payment_date timestamptz,
  is_estimated boolean default false,
  notes text,
  created_at timestamptz default now() not null
);

-- ── 6. Watchlist ─────────────────────────────

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  ticker text not null,
  notes text,
  target_buy_price numeric,
  added_at timestamptz default now() not null
);

-- ── 7. Alerts ────────────────────────────────

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  ticker text not null,
  condition text not null check (condition in ('above', 'below')),
  target_price numeric not null,
  currency text not null check (currency in ('USD', 'ARS')),
  is_active boolean default true not null,
  triggered_at timestamptz,
  notification_sent boolean default false,
  created_at timestamptz default now() not null
);

-- ── Indexes (performance) ────────────────────

create index idx_holdings_user_id on public.holdings(user_id);
create index idx_holdings_ticker on public.holdings(ticker);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_holding_id on public.transactions(holding_id);
create index idx_transactions_date on public.transactions(date);
create index idx_dividends_user_id on public.dividends(user_id);
create index idx_dividends_holding_id on public.dividends(holding_id);
create index idx_watchlist_user_id on public.watchlist(user_id);
create index idx_alerts_user_id on public.alerts(user_id);
create index idx_alerts_active on public.alerts(is_active) where is_active = true;

-- ── Auto-update updated_at ───────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_users
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_user_preferences
  before update on public.user_preferences
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_holdings
  before update on public.holdings
  for each row execute function public.handle_updated_at();

-- ── RLS Policies (disabled for now) ──────────
-- Since auth isn't set up yet, we disable RLS
-- so the API can read/write freely during dev.
-- Re-enable these when you add Better Auth.

alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;
alter table public.dividends enable row level security;
alter table public.watchlist enable row level security;
alter table public.alerts enable row level security;

-- Temporary: allow all operations for development
-- REMOVE these and add proper policies when auth is ready

create policy "dev_all_users" on public.users for all using (true) with check (true);
create policy "dev_all_user_preferences" on public.user_preferences for all using (true) with check (true);
create policy "dev_all_holdings" on public.holdings for all using (true) with check (true);
create policy "dev_all_transactions" on public.transactions for all using (true) with check (true);
create policy "dev_all_dividends" on public.dividends for all using (true) with check (true);
create policy "dev_all_watchlist" on public.watchlist for all using (true) with check (true);
create policy "dev_all_alerts" on public.alerts for all using (true) with check (true);
