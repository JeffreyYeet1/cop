from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from datetime import datetime
from services.google_calendar_service import GoogleCalendarService
from services.token_service import TokenService

router = APIRouter()

@router.get("/calendars")
async def list_calendars(request: Request):
    """List all calendars for the authenticated user."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        calendar_service = GoogleCalendarService(token)
        calendars = await calendar_service.list_calendars()
        return calendars
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/events")
async def list_events(
    request: Request,
    calendar_id: str = "primary",
    time_min: Optional[str] = None,
    time_max: Optional[str] = None,
    max_results: Optional[int] = 100
):
    """List events from a calendar."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        calendar_service = GoogleCalendarService(token)
        events = await calendar_service.list_events(
            calendar_id=calendar_id,
            time_min=time_min,
            time_max=time_max,
            max_results=max_results
        )
        return events
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/events")
async def create_event(request: Request, event_data: dict, calendar_id: str = "primary"):
    """Create a new event in a calendar."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        calendar_service = GoogleCalendarService(token)
        event = await calendar_service.create_event(calendar_id, event_data)
        return event
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/events/{event_id}")
async def update_event(
    request: Request,
    event_id: str,
    event_data: dict,
    calendar_id: str = "primary"
):
    """Update an existing event in a calendar."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        calendar_service = GoogleCalendarService(token)
        event = await calendar_service.update_event(calendar_id, event_id, event_data)
        return event
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(request: Request, event_id: str, calendar_id: str = "primary"):
    """Delete an event from a calendar."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        calendar_service = GoogleCalendarService(token)
        await calendar_service.delete_event(calendar_id, event_id)
        return {"status": "success", "message": "Event deleted"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 