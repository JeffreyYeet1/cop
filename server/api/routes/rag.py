"""Authenticated retrieval and generation endpoints shared by the app and MCP."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from api.dependencies import get_current_user
from schemas.user import User
from services.task_rag import TaskRAGService

router = APIRouter(tags=['task-rag'])


class TaskQuestion(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)

    @field_validator('query')
    @classmethod
    def nonblank(cls, value):
        value = value.strip()
        if not value:
            raise ValueError('Query must not be blank')
        return value


def get_rag_service():
    return TaskRAGService()


@router.post('/search')
async def search_tasks(question: TaskQuestion, user: User = Depends(get_current_user),
                       service: TaskRAGService = Depends(get_rag_service)):
    return {'sources': await service.search(user.id, question.query, question.limit)}


@router.post('/ask')
async def ask_tasks(question: TaskQuestion, user: User = Depends(get_current_user),
                    service: TaskRAGService = Depends(get_rag_service)):
    return await service.answer(user.id, question.query, question.limit)
