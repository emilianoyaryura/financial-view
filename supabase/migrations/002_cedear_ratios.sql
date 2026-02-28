-- =============================================
-- CEDEAR Ratios table
-- Stores the official conversion ratios from Banco Comafi
-- Run: POST /api/cedear-ratios to sync from source
-- =============================================

create table public.cedear_ratios (
  id uuid primary key default gen_random_uuid(),
  ticker text unique not null,
  name text not null,
  ratio numeric not null,
  market text,
  underlying_type text,
  country text,
  industry text,
  updated_at timestamptz default now() not null
);

create index idx_cedear_ratios_ticker on public.cedear_ratios(ticker);

-- RLS (open for dev)
alter table public.cedear_ratios enable row level security;
create policy "dev_all_cedear_ratios" on public.cedear_ratios for all using (true) with check (true);
