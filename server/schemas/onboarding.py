from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class OnboardingAnswerBase(BaseModel):
    question: str
    answer: str

class OnboardingAnswerCreate(OnboardingAnswerBase):
    pass

class OnboardingAnswer(OnboardingAnswerBase):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True 