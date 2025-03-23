from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.todo import Todo, TodoCreate
from services.todo_service import create_todo, get_user_todos, get_todo, update_todo, delete_todo
from api.dependencies import get_current_user
from schemas.user import User

router = APIRouter(
    tags=["todo"]
)

@router.post("/", response_model=Todo)
async def create_todo_item(todo: TodoCreate, current_user: User = Depends(get_current_user)):
    """Create a new todo item"""
    return create_todo(todo, current_user.id)

@router.get("/", response_model=List[Todo])
async def read_todos(current_user: User = Depends(get_current_user)):
    """Get all todos for the current user"""
    return get_user_todos(current_user.id)

@router.get("/{todo_id}", response_model=Todo)
async def read_todo(todo_id: int, current_user: User = Depends(get_current_user)):
    """Get a specific todo by ID"""
    todo = get_todo(todo_id, current_user.id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=Todo)
async def update_todo_item(todo_id: int, todo: TodoCreate, current_user: User = Depends(get_current_user)):
    """Update a todo item"""
    updated_todo = update_todo(todo_id, todo, current_user.id)
    if not updated_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated_todo

@router.delete("/{todo_id}")
async def delete_todo_item(todo_id: int, current_user: User = Depends(get_current_user)):
    """Delete a todo item"""
    if not delete_todo(todo_id, current_user.id):
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully"} 