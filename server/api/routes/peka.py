from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.peka import Task, PekaResponse
from services.peka_service import PekaService
from api.dependencies import get_current_user
from schemas.user import User
from pydantic import BaseModel
import os

router = APIRouter(
    tags=["peka"]
)

class AnalyzeTasksRequest(BaseModel):
    tasks: List[Task]

@router.post("/analyze", response_model=PekaResponse)
async def analyze_tasks(
    request: AnalyzeTasksRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze tasks and provide recommendations"""
    try:
        cohere_api_key = "p2xwdMnfu4WVqcMPamT6CExhxVsl5RjmM5veS3o2"
        if not cohere_api_key:
            raise HTTPException(
                status_code=500,
                detail="Cohere API key not configured"
            )

        peka_service = PekaService(cohere_api_key)
        response = await peka_service.analyze_tasks(request.tasks)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing tasks: {str(e)}"
        ) 