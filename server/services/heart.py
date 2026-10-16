"""Personal HEART signals from recorded activity; no model estimates or product-wide rates."""
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import HTTPException


def get_zone(name):
    try:
        return ZoneInfo(name)
    except (ZoneInfoNotFoundError, ValueError):
        raise HTTPException(422, 'Use a valid IANA timezone, such as America/Toronto.')


def instant(value):
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def week_bounds(zone, now=None):
    today = (now or datetime.now(timezone.utc)).astimezone(zone).replace(hour=0, minute=0, second=0, microsecond=0)
    return today - timedelta(days=6), today + timedelta(days=1)


def summarize(data, user_id, zone_name='UTC', now=None):
    zone = get_zone(zone_name)
    start, end = week_bounds(zone, now)
    prior = start - timedelta(days=7)
    events = [e for e in data['events'] if e['user_id'] == user_id]
    sessions = [e for e in data['sessions'] if e['user_id'] == user_id]
    checkins = [e for e in data['checkins'] if e['user_id'] == user_id]

    def period(left, right):
        selected = [e for e in events if left <= instant(e['created_at']) < right]
        focused = [e for e in sessions if left <= instant(e['started_at']) < right]
        ratings = [e['score'] for e in checkins if left.date().isoformat() <= e['local_date'] < right.date().isoformat()]
        active = {instant(e['created_at']).astimezone(zone).date().isoformat() for e in selected}
        active.update(instant(e['started_at']).astimezone(zone).date().isoformat() for e in focused)
        completed = [e for e in focused if e['status'] == 'completed']
        return {'active_days': len(active), 'clarity_score': round(sum(ratings) / len(ratings), 1) if ratings else None,
                'checkins': len(ratings), 'tasks_created': sum(e['kind'] == 'task_created' for e in selected),
                'tasks_completed': sum(e['kind'] == 'task_completed' for e in selected),
                'focus_started': len(focused), 'focus_completed': len(completed),
                'focus_minutes': round(sum(e['actual_seconds'] for e in focused if e['status'] != 'active') / 60, 1),
                'completion_rate': round(len(completed) / len(focused) * 100) if focused else None}

    current, previous = period(start, end), period(prior, start)
    series = []
    for day in range(7):
        left = start + timedelta(days=day)
        series.append({'date': left.date().isoformat(), **period(left, left + timedelta(days=1))})
    return {'period': {'start': start.isoformat(), 'end': end.isoformat(), 'timezone': zone_name},
            'current': current, 'previous': previous, 'series': series,
            'heart': {
                'happiness': {'score': current['clarity_score'], 'responses': current['checkins'], 'previous_score': previous['clarity_score']},
                'engagement': {'active_days': current['active_days'], 'previous_active_days': previous['active_days']},
                'adoption': {'first_task_at': data.get('first_task_at'), 'first_focus_at': data.get('first_focus_at')},
                'retention': {'returned': bool(current['active_days']) if previous['active_days'] else None},
                'task_success': {'focus_started': current['focus_started'], 'focus_completed': current['focus_completed'], 'completion_rate': current['completion_rate']}}}


def validate_finish(session, status, actual_seconds, now=None):
    if not session:
        raise HTTPException(404, 'Focus session not found.')
    if session['status'] != 'active':
        return session  # Retries cannot change a finished session.
    elapsed = max(0, int(((now or datetime.now(timezone.utc)) - instant(session['started_at'])).total_seconds()))
    if actual_seconds > min(session['planned_seconds'], elapsed + 1):
        raise HTTPException(422, 'Recorded focus time exceeds the session duration or elapsed time.')
    if status == 'completed' and actual_seconds < session['planned_seconds']:
        raise HTTPException(422, 'Complete the planned duration, or end this session early.')
    return None
