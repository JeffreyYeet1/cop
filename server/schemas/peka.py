from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TaskDetails(BaseModel):
    title: str
    description: str
    priority: str  # 'low' | 'medium' | 'high'
    estimated_duration: int
    task_id: Optional[int] = None

class UnifiedResponse(BaseModel):
    intent: str  # 'create' | 'analyze' | 'general'
    task_details: Optional[TaskDetails] = None
    message: str
    action_items: List[str]
    timestamp: datetime

class Task(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    priority: str  # 'low' | 'medium' | 'high'
    estimated_duration: Optional[int] = None
    created_at: datetime
    progress: Optional[str] = 'not_started'  # 'not_started' | 'in_progress' | 'completed'

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
    timestamp: datetime 