"""Backend-only activity storage. Every query is explicitly owner-scoped."""
from datetime import datetime, timezone
from db.supabase import create_supabase_client


def database():
    return create_supabase_client()


def all_rows(query):
    rows, offset = [], 0
    while True:
        page = query.range(offset, offset + 999).execute().data or []
        rows.extend(page)
        if len(page) < 1000:
            return rows
        offset += 1000


def snapshot(user_id, since, until):
    db = database()
    db.rpc('expire_focus_sessions', {'p_user_id': user_id}).execute()
    events = all_rows(db.table('activity_events').select('*').eq('user_id', user_id).gte('created_at', since).lt('created_at', until).order('created_at').order('id'))
    sessions = all_rows(db.table('focus_sessions').select('*').eq('user_id', user_id).gte('started_at', since).lt('started_at', until).order('started_at').order('id'))
    checkins = all_rows(db.table('clarity_checkins').select('*').eq('user_id', user_id).gte('local_date', since[:10]).lte('local_date', until[:10]).order('local_date'))
    first_task = db.table('activity_events').select('created_at').eq('user_id', user_id).eq('kind', 'task_created').order('created_at').limit(1).execute().data
    first_focus = db.table('focus_sessions').select('started_at').eq('user_id', user_id).order('started_at').limit(1).execute().data
    return {'events': events, 'sessions': sessions, 'checkins': checkins,
            'first_task_at': first_task[0]['created_at'] if first_task else None,
            'first_focus_at': first_focus[0]['started_at'] if first_focus else None}


def save_checkin(user_id, local_date, score):
    return database().table('clarity_checkins').upsert({'user_id': user_id, 'local_date': local_date, 'score': score, 'updated_at': datetime.now(timezone.utc).isoformat()}).execute().data[0]


def start_session(user_id, session_id, planned_seconds):
    return database().rpc('start_focus_session', {'p_user_id': user_id, 'p_session_id': str(session_id), 'p_planned_seconds': planned_seconds}).execute().data


def heartbeat_session(user_id, session_id, actual_seconds):
    from fastapi import HTTPException
    try:
        result = database().rpc('heartbeat_focus_session', {'p_user_id': user_id, 'p_session_id': str(session_id), 'p_actual_seconds': actual_seconds}).execute().data
    except Exception as error:
        if getattr(error, 'code', None) == '22023':
            raise HTTPException(422, 'Focus progress exceeds the session duration or elapsed time.') from error
        raise
    if not result:
        raise HTTPException(404, 'Focus session not found.')
    return result


def get_session(user_id, session_id):
    database().rpc('expire_focus_sessions', {'p_user_id': user_id}).execute()
    rows = database().table('focus_sessions').select('*').eq('user_id', user_id).eq('id', str(session_id)).execute().data
    return rows[0] if rows else None


def finish_session(user_id, session_id, status, actual_seconds):
    rows = database().table('focus_sessions').update({'status': status, 'actual_seconds': actual_seconds, 'ended_at': datetime.now(timezone.utc).isoformat()}).eq('user_id', user_id).eq('id', str(session_id)).eq('status', 'active').execute().data
    return rows[0] if rows else get_session(user_id, session_id)
