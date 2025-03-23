import httpx
from typing import Optional, Dict, Any, List

class GoogleCalendarService:
    BASE_URL = "https://www.googleapis.com/calendar/v3"

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }

    async def list_calendars(self) -> List[Dict[str, Any]]:
        """List all calendars for the authenticated user."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/users/me/calendarList",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])

    async def list_events(
        self,
        calendar_id: str = "primary",
        time_min: Optional[str] = None,
        time_max: Optional[str] = None,
        max_results: Optional[int] = 100
    ) -> List[Dict[str, Any]]:
        """List events from a calendar."""
        params = {"maxResults": max_results}
        if time_min:
            params["timeMin"] = time_min
        if time_max:
            params["timeMax"] = time_max

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.BASE_URL}/calendars/{calendar_id}/events",
                headers=self.headers,
                params=params
            )
            response.raise_for_status()
            data = response.json()
            return data.get("items", [])

    async def create_event(
        self,
        calendar_id: str,
        event_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new event in a calendar."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/calendars/{calendar_id}/events",
                headers=self.headers,
                json=event_data
            )
            response.raise_for_status()
            return response.json()

    async def update_event(
        self,
        calendar_id: str,
        event_id: str,
        event_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing event in a calendar."""
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.BASE_URL}/calendars/{calendar_id}/events/{event_id}",
                headers=self.headers,
                json=event_data
            )
            response.raise_for_status()
            return response.json()

    async def delete_event(self, calendar_id: str, event_id: str) -> None:
        """Delete an event from a calendar."""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.BASE_URL}/calendars/{calendar_id}/events/{event_id}",
                headers=self.headers
            )
            response.raise_for_status() 