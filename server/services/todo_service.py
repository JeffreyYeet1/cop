from schemas.todo import TodoCreate
from repositories.todo_repo import create_todo as repo_create_todo, get_user_todos as repo_get_user_todos, get_todo as repo_get_todo, update_todo as repo_update_todo, delete_todo as repo_delete_todo
from fastapi import HTTPException

def create_todo(todo: TodoCreate, user_id: int):
    """Create a new todo item"""
    try:
        print(f"Creating todo for user {user_id}: {todo.dict()}")
        data = {
            "user_id": user_id,
            "title": todo.title,
            "description": todo.description,
            "priority": todo.priority,
            "estimated_duration": todo.estimated_duration,
            "progress": todo.progress
        }
        print(f"Formatted data for database: {data}")
        result = repo_create_todo(data)
        if result is None:
            raise HTTPException(status_code=500, detail="Failed to create todo")
        return result
    except Exception as e:
        print(f"Error in create_todo service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_user_todos(user_id: int):
    """Get all todos for a specific user"""
    try:
        print(f"Getting todos for user {user_id}")
        return repo_get_user_todos(user_id)
    except Exception as e:
        print(f"Error in get_user_todos service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_todo(todo_id: int, user_id: int):
    """Get a specific todo by ID and user_id"""
    try:
        print(f"Getting todo {todo_id} for user {user_id}")
        todo = repo_get_todo(todo_id, user_id)
        if todo is None:
            raise HTTPException(status_code=404, detail="Todo not found")
        return todo
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in get_todo service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def update_todo(todo_id: int, todo: TodoCreate, user_id: int):
    """Update a todo item"""
    try:
        print(f"Updating todo {todo_id} for user {user_id}: {todo.dict()}")
        data = todo.model_dump()
        result = repo_update_todo(todo_id, user_id, data)
        if result is None:
            raise HTTPException(status_code=404, detail="Todo not found")
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in update_todo service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def delete_todo(todo_id: int, user_id: int):
    """Delete a todo item"""
    try:
        print(f"Deleting todo {todo_id} for user {user_id}")
        if not repo_delete_todo(todo_id, user_id):
            raise HTTPException(status_code=404, detail="Todo not found")
        return True
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in delete_todo service: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 