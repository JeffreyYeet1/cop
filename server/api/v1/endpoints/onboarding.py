from fastapi import APIRouter, Depends, HTTPException
from typing import List

from schemas.user import User
from schemas.onboarding import OnboardingAnswer, OnboardingAnswerCreate
from crud.onboarding import create_onboarding_answer, get_user_onboarding_answers
from core.security import get_current_active_user

router = APIRouter()

@router.post("/onboarding/answers", response_model=OnboardingAnswer)
async def create_answer(
    answer: OnboardingAnswerCreate,
    current_user: User = Depends(get_current_active_user)
) -> OnboardingAnswer:
    """Create an onboarding answer for the current user."""
    db_answer = await create_onboarding_answer(current_user.id, answer)
    if not db_answer:
        raise HTTPException(status_code=400, detail="Could not create onboarding answer")
    return db_answer

@router.get("/onboarding/answers", response_model=List[OnboardingAnswer])
async def get_answers(
    current_user: User = Depends(get_current_active_user)
) -> List[OnboardingAnswer]:
    """Get all onboarding answers for the current user."""
    return await get_user_onboarding_answers(current_user.id) 