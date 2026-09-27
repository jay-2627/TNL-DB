create table if not exists users (
  id bigserial primary key,
  name text unique not null,
  password_hash text not null,
  role text not null default 'FOUNDER',
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id bigserial primary key,
  name text not null,
  role text not null,
  open_tasks integer not null default 0,
  workload_pct integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id bigserial primary key,
  name text not null,
  industry text not null,
  spend numeric(12,2) not null default 0,
  leads integer not null default 0,
  qualified integer not null default 0,
  converted integer not null default 0,
  revenue numeric(12,2) not null default 0,
  roas numeric(10,2) not null default 0,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id bigserial primary key,
  client_id bigint not null references clients(id) on delete cascade,
  name text not null,
  spend numeric(12,2) not null default 0,
  impressions integer not null default 0,
  reach integer not null default 0,
  ctr numeric(10,2) not null default 0,
  cpc numeric(10,2) not null default 0,
  clicks integer not null default 0,
  cpl numeric(10,2) not null default 0,
  conversions integer not null default 0,
  cpa numeric(10,2) not null default 0,
  roas numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id bigserial primary key,
  client_id bigint references clients(id) on delete set null,
  source text not null default 'Meta Ads',
  stage text not null default 'New',
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id bigserial primary key,
  title text not null,
  owner text not null,
  priority text not null,
  due_date date,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id bigserial primary key,
  client_id bigint references clients(id) on delete set null,
  amount numeric(12,2) not null,
  due_date date,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id bigserial primary key,
  name text not null,
  revenue numeric(12,2) not null default 0
);

create index if not exists idx_campaigns_client on campaigns(client_id);
create index if not exists idx_leads_client on leads(client_id);
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_payments_status on payments(status);
