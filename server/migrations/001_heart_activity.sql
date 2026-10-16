-- Apply once to the existing Supabase project, in a transaction.
-- The API uses a server-only service_role key; custom app JWTs are checked by FastAPI.
begin;
alter table public.todo add column if not exists completed_at timestamptz;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id bigint not null references public.users(id) on delete cascade,
  kind text not null check (kind in ('task_created','task_completed','assistant_used')),
  task_id bigint,
  created_at timestamptz not null default now()
);
create index if not exists activity_events_owner_time on public.activity_events(user_id, created_at);

create table if not exists public.focus_sessions (
  id uuid primary key,
  user_id bigint not null references public.users(id) on delete cascade,
  planned_seconds integer not null check (planned_seconds between 60 and 14400),
  actual_seconds integer not null default 0 check (actual_seconds between 0 and 14400),
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  check ((status = 'active' and ended_at is null) or (status <> 'active' and ended_at is not null))
);
create index if not exists focus_sessions_owner_time on public.focus_sessions(user_id, started_at);

create table if not exists public.clarity_checkins (
  user_id bigint not null references public.users(id) on delete cascade,
  local_date date not null,
  score integer not null check (score between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key(user_id, local_date)
);

alter table public.activity_events enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.clarity_checkins enable row level security;
revoke all on public.activity_events, public.focus_sessions, public.clarity_checkins from anon, authenticated;
grant all on public.activity_events, public.focus_sessions, public.clarity_checkins to service_role;

-- Capture task changes in the same transaction as the write, including AI-created tasks.
create or replace function public.record_task_activity() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.activity_events(user_id, kind, task_id) values (NEW.user_id, 'task_created', NEW.id);
  elsif OLD.completed_at is null and NEW.completed_at is not null then
    insert into public.activity_events(user_id, kind, task_id) values (NEW.user_id, 'task_completed', NEW.id);
  end if;
  return NEW;
end;
$$;
revoke all on function public.record_task_activity() from public;
drop trigger if exists todo_activity on public.todo;
create trigger todo_activity after insert or update on public.todo
for each row execute function public.record_task_activity();
commit;
