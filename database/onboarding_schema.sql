-- Lumofy Employee Onboarding Management
-- Starter PostgreSQL / Supabase schema for MVP implementation.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_namespace
    where nspname = 'auth'
  ) then
    execute 'create schema auth';
    execute $fn$
      create function auth.uid()
      returns uuid
      language sql
      stable
      as $body$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $body$
    $fn$;
    execute $fn$
      create function auth.jwt()
      returns jsonb
      language sql
      stable
      as $body$
        select coalesce(nullif(current_setting('request.jwt.claim', true), ''), '{}')::jsonb
      $body$
    $fn$;
  end if;
end
$$;

create type onboarding_plan_status as enum (
  'draft',
  'preparing',
  'ready_for_day_1',
  'in_progress',
  'delayed',
  'awaiting_manager_confirmation',
  'completed',
  'cancelled'
);

create type onboarding_task_status as enum (
  'not_started',
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);

create type onboarding_goal_status as enum (
  'not_started',
  'in_progress',
  'at_risk',
  'completed'
);

create type onboarding_access_status as enum (
  'not_required',
  'not_requested',
  'requested',
  'in_progress',
  'created',
  'shared_with_employee',
  'tested',
  'access_issue',
  'completed'
);

create type onboarding_owner_role as enum (
  'hr',
  'manager',
  'employee',
  'buddy',
  'it',
  'operations'
);

create type onboarding_task_category as enum (
  'pre_start',
  'day_1',
  'week_1',
  'training',
  'documents',
  'access',
  'equipment',
  'goals',
  'check_in',
  'other'
);

create type onboarding_milestone as enum (
  'day_1',
  'week_1',
  'day_30',
  'day_60',
  'day_90',
  'probation'
);

create table if not exists onboarding_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_department_id uuid,
  target_job_title_id uuid,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references onboarding_templates(id) on delete cascade,
  title text not null,
  description text,
  category onboarding_task_category not null default 'other',
  owner_role onboarding_owner_role not null,
  due_offset_days integer not null,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists onboarding_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null,
  template_id uuid references onboarding_templates(id),
  manager_id uuid,
  buddy_employee_id uuid,
  hr_owner_id uuid,
  start_date date not null,
  status onboarding_plan_status not null default 'draft',
  progress_percentage numeric(5,2) not null default 0,
  overdue_task_count integer not null default 0,
  current_stage text,
  completion_notes text,
  employee_acknowledged_at timestamptz,
  manager_confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, start_date)
);

create table if not exists onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  title text not null,
  description text,
  category onboarding_task_category not null default 'other',
  owner_role onboarding_owner_role not null,
  owner_user_id uuid,
  due_date date,
  status onboarding_task_status not null default 'not_started',
  is_required boolean not null default true,
  is_critical boolean not null default false,
  completed_at timestamptz,
  completed_by uuid,
  notes text,
  attachment_url text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists onboarding_tasks_plan_idx
  on onboarding_tasks (onboarding_plan_id);

create index if not exists onboarding_tasks_owner_idx
  on onboarding_tasks (owner_user_id, status, due_date);

create table if not exists onboarding_goals (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  milestone onboarding_milestone not null,
  title text not null,
  description text,
  success_measure text,
  owner_user_id uuid,
  target_date date,
  status onboarding_goal_status not null default 'not_started',
  progress_percentage numeric(5,2) not null default 0,
  manager_feedback text,
  employee_reflection text,
  supporting_evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_checkins (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  milestone onboarding_milestone not null,
  checkin_date timestamptz not null,
  participants jsonb not null default '[]'::jsonb,
  discussion_points text,
  employee_confidence_rating integer,
  manager_confidence_rating integer,
  blockers text,
  support_required text,
  next_actions text,
  private_manager_notes text,
  employee_visible_notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_access_items (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  tool_name text not null,
  purpose text,
  access_level text,
  owner_role onboarding_owner_role not null,
  owner_user_id uuid,
  status onboarding_access_status not null default 'not_requested',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_schedule_items (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  title text not null,
  description text,
  scheduled_at timestamptz not null,
  duration_minutes integer,
  location text,
  meeting_url text,
  owner_user_id uuid,
  attendees jsonb not null default '[]'::jsonb,
  status onboarding_task_status not null default 'not_started',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_documents (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  title text not null,
  document_url text not null,
  due_date date,
  is_required boolean not null default true,
  requires_acknowledgement boolean not null default false,
  acknowledged_at timestamptz,
  completion_status onboarding_task_status not null default 'not_started',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_audit_logs (
  id uuid primary key default gen_random_uuid(),
  onboarding_plan_id uuid not null references onboarding_plans(id) on delete cascade,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_audit_logs_plan_idx
  on onboarding_audit_logs (onboarding_plan_id, created_at desc);

-- Progress should be updated by application logic or triggers.
-- Suggested formula: completed required tasks / total required tasks * 100.

alter table onboarding_plans enable row level security;
alter table onboarding_tasks enable row level security;
alter table onboarding_goals enable row level security;
alter table onboarding_checkins enable row level security;
alter table onboarding_access_items enable row level security;
alter table onboarding_schedule_items enable row level security;
alter table onboarding_documents enable row level security;
alter table onboarding_audit_logs enable row level security;

-- Placeholder policies. Replace helper functions and role checks with project-specific auth tables.

create policy "hr_full_access_onboarding_plans"
on onboarding_plans
for all
using (auth.jwt() ->> 'role' in ('hr_admin', 'super_admin'))
with check (auth.jwt() ->> 'role' in ('hr_admin', 'super_admin'));

create policy "employee_view_own_plan"
on onboarding_plans
for select
using (employee_id = auth.uid());

create policy "manager_view_direct_report_plan"
on onboarding_plans
for select
using (manager_id = auth.uid());

create policy "employee_view_own_tasks"
on onboarding_tasks
for select
using (
  exists (
    select 1
    from onboarding_plans p
    where p.id = onboarding_tasks.onboarding_plan_id
      and p.employee_id = auth.uid()
  )
);

create policy "employee_update_owned_tasks"
on onboarding_tasks
for update
using (owner_user_id = auth.uid() and owner_role = 'employee')
with check (owner_user_id = auth.uid() and owner_role = 'employee');

create policy "manager_update_manager_tasks"
on onboarding_tasks
for update
using (owner_user_id = auth.uid() and owner_role = 'manager')
with check (owner_user_id = auth.uid() and owner_role = 'manager');

create policy "buddy_update_buddy_tasks"
on onboarding_tasks
for update
using (owner_user_id = auth.uid() and owner_role = 'buddy')
with check (owner_user_id = auth.uid() and owner_role = 'buddy');

create policy "it_update_access_items"
on onboarding_access_items
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());
