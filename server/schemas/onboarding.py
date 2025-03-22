from pydantic import BaseModel
from typing import List

class PreferenceItem(BaseModel):
    questionText: str
    answerId: str
    answerText: str

class OnboardingPreferences(BaseModel):
    preferences: List[PreferenceItem] 