from datetime import datetime
from typing import Optional, List
from uuid import uuid4
from pydantic import BaseModel, EmailStr, Field
from .onboarding import OnboardingAnswer

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    verification_code: Optional[str] = None
    verification_expires_at: Optional[datetime] = None
    daily_task_goal: Optional[int] = None
    current_streak: Optional[int] = None
    last_streak_update: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    onboarding_answers: List[OnboardingAnswer] = []

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str 