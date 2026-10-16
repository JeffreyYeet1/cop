-- Apply after 001_heart_activity.sql. Backend service_role access only.
begin;
alter table public.focus_sessions add column if not exists last_heartbeat_at timestamptz;
update public.focus_sessions set last_heartbeat_at = started_at where last_heartbeat_at is null;
alter table public.focus_sessions alter column last_heartbeat_at set default now();
alter table public.focus_sessions alter column last_heartbeat_at set not null;
alter table public.focus_sessions drop constraint if exists focus_sessions_status_check;
alter table public.focus_sessions add constraint focus_sessions_status_check
  check (status in ('active','completed','abandoned','interrupted'));

-- Reconcile pre-migration duplicate sessions before enforcing the invariant.
with ranked as (
  select id, row_number() over (partition by user_id order by started_at desc, id desc) as position
  from public.focus_sessions where status = 'active'
)
update public.focus_sessions set status = 'interrupted', ended_at = last_heartbeat_at
where id in (select id from ranked where position > 1);
create unique index if not exists one_active_focus_per_user
  on public.focus_sessions(user_id) where status = 'active';

create or replace function public.expire_focus_sessions(p_user_id bigint) returns integer
language plpgsql security definer set search_path = public as $$
declare expired integer;
begin
  perform 1 from public.users where id = p_user_id for update;
  update public.focus_sessions set status = 'interrupted', ended_at = last_heartbeat_at
  where user_id = p_user_id and status = 'active'
    and last_heartbeat_at < clock_timestamp() - interval '10 minutes';
  get diagnostics expired = row_count;
  return expired;
end;
$$;

create or replace function public.start_focus_session(p_user_id bigint, p_session_id uuid, p_planned_seconds integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare session_row public.focus_sessions;
begin
  if p_planned_seconds not between 60 and 14400 or p_session_id is null then
    raise exception 'Invalid focus session input' using errcode = '22023';
  end if;
  -- Lock the owner row: concurrent starts for this user serialize inside the transaction.
  perform 1 from public.users where id = p_user_id for update;
  if not found then raise exception 'User not found' using errcode = '22023'; end if;
  perform public.expire_focus_sessions(p_user_id);
  select * into session_row from public.focus_sessions where user_id = p_user_id and id = p_session_id;
  if found then return to_jsonb(session_row) || '{"reused":true}'::jsonb; end if;
  select * into session_row from public.focus_sessions where user_id = p_user_id and status = 'active';
  if found then return to_jsonb(session_row) || '{"reused":true}'::jsonb; end if;
  insert into public.focus_sessions(id, user_id, planned_seconds)
    values (p_session_id, p_user_id, p_planned_seconds) returning * into session_row;
  return to_jsonb(session_row) || '{"reused":false}'::jsonb;
end;
$$;

create or replace function public.heartbeat_focus_session(p_user_id bigint, p_session_id uuid, p_actual_seconds integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare session_row public.focus_sessions;
begin
  perform public.expire_focus_sessions(p_user_id);
  select * into session_row from public.focus_sessions where id = p_session_id and user_id = p_user_id for update;
  if not found then return null; end if;
  if session_row.status <> 'active' then return to_jsonb(session_row); end if;
  if p_actual_seconds is null or p_actual_seconds < 0 or p_actual_seconds > session_row.planned_seconds
     or p_actual_seconds > extract(epoch from clock_timestamp() - session_row.started_at) + 1 then
    raise exception 'Invalid focus progress' using errcode = '22023';
  end if;
  update public.focus_sessions set last_heartbeat_at = clock_timestamp(),
      actual_seconds = greatest(actual_seconds, p_actual_seconds)
  where id = p_session_id returning * into session_row;
  return to_jsonb(session_row);
end;
$$;

revoke all on function public.expire_focus_sessions(bigint) from public, anon, authenticated;
revoke all on function public.start_focus_session(bigint,uuid,integer) from public, anon, authenticated;
revoke all on function public.heartbeat_focus_session(bigint,uuid,integer) from public, anon, authenticated;
grant execute on function public.expire_focus_sessions(bigint) to service_role;
grant execute on function public.start_focus_session(bigint,uuid,integer) to service_role;
grant execute on function public.heartbeat_focus_session(bigint,uuid,integer) to service_role;
commit;
