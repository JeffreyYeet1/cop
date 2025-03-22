from typing import Optional
from datetime import datetime, timezone
from db.supabase import create_supabase_client
from schemas.auth import UserInDB

supabase = create_supabase_client()

async def get_user(username: str) -> Optional[UserInDB]:
    user = supabase.from_("users").select("*").eq("email", username).execute()
    if user.data:
        user_data = user.data[0]
        user_data['hashed_password'] = user_data.pop('password', None)
        return UserInDB(**user_data)
    return None

async def create_user(email: str, name: str, hashed_password: str) -> Optional[UserInDB]:
    user_data = {
        "email": email.lower(),
        "name": name,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    insert_response = supabase.from_("users").insert(user_data).execute()
    if insert_response.data:
        user_data = insert_response.data[0]
        user_data['hashed_password'] = user_data.pop('password', None)
        return UserInDB(**user_data)
    return None

async def user_exists(email: str) -> bool:
    user = supabase.from_("users").select("*").eq("email", email.lower()).execute()
    return len(user.data) > 0 