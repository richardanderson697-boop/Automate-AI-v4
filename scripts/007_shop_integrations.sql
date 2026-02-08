-- Shop Management System Integrations
-- Enables the AI Diagnostic Platform to work as an enhancement layer on top of existing systems

-- Table to store integration credentials per organization
create table if not exists public.organization_integrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  integration_type text not null check (integration_type in ('mitchell1', 'tekmetric', 'shopware', 'none')),
  api_key text not null,
  shop_id text not null,
  location_id text, -- Used by Shop-Ware
  base_url text, -- Optional custom API endpoint
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id)
);

-- Sync activity log
create table if not exists public.integration_sync_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade not null,
  integration_type text not null,
  action text not null, -- 'push_diagnostic', 'pull_customer', 'pull_vehicle', etc.
  external_id text, -- RO number, customer ID, etc. in external system
  status text not null check (status in ('success', 'failed', 'pending')),
  error_message text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_org_integrations_org on public.organization_integrations(organization_id);
create index if not exists idx_sync_log_org on public.integration_sync_log(organization_id);
create index if not exists idx_sync_log_created on public.integration_sync_log(created_at desc);

-- RLS Policies
alter table public.organization_integrations enable row level security;
alter table public.integration_sync_log enable row level security;

-- Organization admins can manage their integrations
create policy "integration_select_own_org" on public.organization_integrations
  for select using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

create policy "integration_insert_own_org" on public.organization_integrations
  for insert with check (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "integration_update_own_org" on public.organization_integrations
  for update using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Sync logs visible to organization members
create policy "sync_log_select_own_org" on public.integration_sync_log
  for select using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

comment on table public.organization_integrations is 'Stores API credentials for integrating with existing shop management systems (Mitchell 1, Tekmetric, Shop-Ware)';
comment on table public.integration_sync_log is 'Activity log for tracking data synchronization between the AI diagnostic platform and external shop systems';
