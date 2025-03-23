from enum import Enum
from pydantic import BaseModel
from datetime import datetime
from typing import List

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskProgress(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class Task(BaseModel):
    id: int
    user_id: str
    title: str
    description: str
    priority: TaskPriority
    estimated_duration: int
    created_at: datetime
    progress: TaskProgress

class TaskRecommendation(BaseModel):
    task_id: int
    reason: str

class PekaResponse(BaseModel):
    sorted_tasks: List[int]
    top_recommendation: TaskRecommendation
    explanation: str

class GeneralResponse(BaseModel):
    response: str
    action_items: List[str]
    timestamp: datetime = datetime.now() 