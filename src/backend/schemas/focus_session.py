from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class FocusSessionBase(BaseModel):
    task_id: Optional[int] = None
    planned_duration: int  # in seconds

class FocusSessionCreate(FocusSessionBase):
    pass

class FocusSessionUpdate(BaseModel):
    end_time: datetime
    actual_duration: int  # in seconds

class FocusSessionResponse(BaseModel):
    id: int
    user_id: int
    task_id: Optional[int] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    planned_duration: int
    actual_duration: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True 