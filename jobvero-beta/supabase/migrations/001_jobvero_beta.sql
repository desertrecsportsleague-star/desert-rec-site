create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  trade text not null,
  avg_wage numeric(12,2) not null default 0,
  labor_burden numeric(12,2) not null default 0,
  crew_size integer not null default 1 check (crew_size > 0),
  target_margin numeric(5,2) not null default 40 check (target_margin >= 0 and target_margin < 100),
  overhead_pct numeric(5,2) not null default 10 check (overhead_pct >= 0),
  tester boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  job_name text,
  service_type text,
  planned_price numeric(12,2) not null,
  crew_hours_est numeric(12,2) not null default 0,
  materials_est numeric(12,2) not null default 0,
  equipment_est numeric(12,2) not null default 0,
  other_est numeric(12,2) not null default 0,
  true_cost_est numeric(12,2) not null,
  recommended_price numeric(12,2) not null,
  target_margin numeric(5,2) not null,
  status text not null default 'open' check(status in ('open','completed','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.job_actuals (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null unique references public.estimates(id) on delete cascade,
  crew_hours_actual numeric(12,2) not null default 0,
  materials_actual numeric(12,2) not null default 0,
  equipment_actual numeric(12,2) not null default 0,
  other_actual numeric(12,2) not null default 0,
  actual_cost numeric(12,2) not null,
  actual_profit numeric(12,2) not null,
  actual_margin numeric(5,2),
  completed_at timestamptz not null default now()
);

create table if not exists public.tester_feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  estimate_id uuid references public.estimates(id) on delete set null,
  payment_intent text check(payment_intent in ('yes','maybe','no')),
  would_pay_59 boolean,
  changed_price boolean,
  usefulness integer check(usefulness between 1 and 5),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;
alter table public.estimates enable row level security;
alter table public.job_actuals enable row level security;
alter table public.tester_feedback enable row level security;

create policy businesses_owner_all on public.businesses for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy estimates_owner_all on public.estimates for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy actuals_owner_all on public.job_actuals for all to authenticated using(exists(select 1 from public.estimates e join public.businesses b on b.id=e.business_id where e.id=estimate_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.estimates e join public.businesses b on b.id=e.business_id where e.id=estimate_id and b.owner_id=auth.uid()));
create policy feedback_owner_all on public.tester_feedback for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

create or replace view public.tester_admin_summary as
select b.id as business_id,b.name,b.trade,b.created_at,
 count(distinct e.id) as estimate_count,
 count(distinct a.id) as completed_job_count,
 max(f.payment_intent) filter(where f.created_at=(select max(f2.created_at) from public.tester_feedback f2 where f2.business_id=b.id)) as latest_payment_intent
from public.businesses b
left join public.estimates e on e.business_id=b.id
left join public.job_actuals a on a.estimate_id=e.id
left join public.tester_feedback f on f.business_id=b.id
group by b.id,b.name,b.trade,b.created_at;

revoke all on public.tester_admin_summary from anon, authenticated;
