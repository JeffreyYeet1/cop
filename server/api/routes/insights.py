from datetime import datetime, timedelta, timezone
from typing import Literal
from uuid import UUID
from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from api.dependencies import get_current_user
from schemas.user import User
from services.heart import get_zone, week_bounds, summarize, validate_finish

router = APIRouter(tags=['insights'])


def get_store():
    from repositories import activity_repo
    return activity_repo


class Checkin(BaseModel):
    score: int = Field(ge=1, le=5)
    timezone: str = Field(default='UTC', max_length=100)


class FocusStart(BaseModel):
    id: UUID
    planned_seconds: int = Field(ge=60, le=14400)


class FocusFinish(BaseModel):
    status: Literal['completed', 'abandoned']
    actual_seconds: int = Field(ge=0, le=14400)


async def summary_for(user_id, zone_name, store):
    zone = get_zone(zone_name)
    start, end = week_bounds(zone)
    # Fetch one extra local-date margin for extreme UTC offsets and DST.
    since = (start - timedelta(days=8)).astimezone(timezone.utc).isoformat()
    until = (end + timedelta(days=1)).astimezone(timezone.utc).isoformat()
    data = await run_in_threadpool(store.snapshot, user_id, since, until)
    return summarize(data, user_id, zone_name)


@router.get('/summary')
async def read_summary(timezone: str = Query(default='UTC', max_length=100), user: User = Depends(get_current_user), store=Depends(get_store)):
    return await summary_for(user.id, timezone, store)


@router.post('/checkins')
async def check_in(body: Checkin, user: User = Depends(get_current_user), store=Depends(get_store)):
    day = datetime.now(get_zone(body.timezone)).date().isoformat()
    return await run_in_threadpool(store.save_checkin, user.id, day, body.score)


@router.post('/focus')
async def start_focus(body: FocusStart, user: User = Depends(get_current_user), store=Depends(get_store)):
    return await run_in_threadpool(store.start_session, user.id, body.id, body.planned_seconds)


@router.patch('/focus/{session_id}')
async def finish_focus(session_id: UUID, body: FocusFinish, user: User = Depends(get_current_user), store=Depends(get_store)):
    session = await run_in_threadpool(store.get_session, user.id, session_id)
    existing = validate_finish(session, body.status, body.actual_seconds)
    if existing:
        return existing
    return await run_in_threadpool(store.finish_session, user.id, session_id, body.status, body.actual_seconds)
