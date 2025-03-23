from typing import Optional, List
from schemas.todo import Todo
from db.supabase import create_supabase_client

supabase = create_supabase_client()

def create_todo(data: dict) -> Optional[Todo]:
    try:
        print(f"Repository: Creating todo with data: {data}")
        result = supabase.from_("todo").insert(data).execute()
        print(f"Repository: Supabase response: {result}")
        if result.data and len(result.data) > 0:
            return Todo(**result.data[0])
        print("Repository: No data returned from Supabase")
        return None
    except Exception as e:
        print(f"Repository Error creating todo: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

def get_user_todos(user_id: int) -> List[Todo]:
    try:
        print(f"Repository: Getting todos for user {user_id}")
        result = supabase.from_("todo").select("*").eq("user_id", user_id).execute()
        print(f"Repository: Supabase response: {result}")
        return [Todo(**todo) for todo in result.data]
    except Exception as e:
        print(f"Repository Error getting user todos: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

def get_todo(todo_id: int, user_id: int) -> Optional[Todo]:
    try:
        print(f"Repository: Getting todo {todo_id} for user {user_id}")
        result = supabase.from_("todo").select("*").eq("id", todo_id).eq("user_id", user_id).single().execute()
        print(f"Repository: Supabase response: {result}")
        if result.data:
            return Todo(**result.data)
        return None
    except Exception as e:
        print(f"Repository Error getting todo: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

def update_todo(todo_id: int, user_id: int, data: dict) -> Optional[Todo]:
    try:
        print(f"Repository: Updating todo {todo_id} for user {user_id} with data: {data}")
        result = supabase.from_("todo").update(data).eq("id", todo_id).eq("user_id", user_id).execute()
        print(f"Repository: Supabase response: {result}")
        if result.data and len(result.data) > 0:
            return Todo(**result.data[0])
        return None
    except Exception as e:
        print(f"Repository Error updating todo: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

def delete_todo(todo_id: int, user_id: int) -> bool:
    try:
        print(f"Repository: Deleting todo {todo_id} for user {user_id}")
        result = supabase.from_("todo").delete().eq("id", todo_id).eq("user_id", user_id).execute()
        print(f"Repository: Supabase response: {result}")
        return bool(result.data)
    except Exception as e:
        print(f"Repository Error deleting todo: {str(e)}")
        raise Exception(f"Database error: {str(e)}") 