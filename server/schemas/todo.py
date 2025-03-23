from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Progress(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TodoBase(BaseModel):
    title: str
    description: str = ""  # Default to empty string as per DB
    priority: Priority = Priority.LOW  # Default to 'low' as per DB
    estimated_duration: Optional[int] = None  # Can be NULL
    progress: Progress = Progress.NOT_STARTED  # Default to 'not_started' as per DB

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True 