-- Fix RLS policies to allow public customer diagnostic submissions
-- Customers don't have organization context when submitting, only mechanics reviewing do

-- Drop existing restrictive policies
drop policy if exists "requests_select_org" on public.customer_diagnostic_requests;
drop policy if exists "requests_insert_org" on public.customer_diagnostic_requests;
drop policy if exists "requests_update_org" on public.customer_diagnostic_requests;

-- Allow public to insert diagnostic requests without authentication
create policy "customer_requests_insert_public" 
  on public.customer_diagnostic_requests
  for insert 
  with check (true); -- Anyone can submit

-- Allow public to view their own request by ID (for status page)
create policy "customer_requests_select_by_id" 
  on public.customer_diagnostic_requests
  for select 
  using (true); -- Anyone can view (we'll filter by ID in the app)

-- Allow authenticated shop staff to view requests for their organization
create policy "customer_requests_select_own_org" 
  on public.customer_diagnostic_requests
  for select 
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Allow authenticated shop staff to update requests for their organization
create policy "customer_requests_update_own_org" 
  on public.customer_diagnostic_requests
  for update 
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Make organization_id nullable for customer submissions
alter table public.customer_diagnostic_requests 
  alter column organization_id drop not null;
