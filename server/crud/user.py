from typing import Optional
from datetime import datetime, timezone
from db.supabase import create_supabase_client
from schemas.auth import UserInDB

supabase = create_supabase_client()

async def get_user(username: str) -> Optional[UserInDB]:
    try:
        user = supabase.from_("users").select("*").eq("email", username).execute()
        if user.data:
            user_data = user.data[0]
            # Convert the data to match our schema
            return UserInDB(
                id=str(user_data.get('id')),
                email=user_data.get('email'),
                name=user_data.get('name'),
                created_at=user_data.get('created_at'),
                hashed_password=user_data.get('password'),
                disabled=user_data.get('disabled', False)
            )
    except Exception as e:
        print(f"Error getting user: {e}")
    return None

async def create_user(email: str, name: str, hashed_password: str) -> Optional[UserInDB]:
    user_data = {
        "email": email.lower(),
        "name": name,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "disabled": False
    }
    
    try:
        insert_response = supabase.from_("users").insert(user_data).execute()
        if insert_response.data:
            created_data = insert_response.data[0]
            return UserInDB(
                id=str(created_data.get('id')),
                email=created_data.get('email'),
                name=created_data.get('name'),
                created_at=created_data.get('created_at'),
                hashed_password=created_data.get('password'),
                disabled=created_data.get('disabled', False)
            )
    except Exception as e:
        print(f"Error creating user: {e}")
    return None

async def user_exists(email: str) -> bool:
    try:
        user = supabase.from_("users").select("*").eq("email", email.lower()).execute()
        return len(user.data) > 0
    except Exception as e:
        print(f"Error checking user existence: {e}")
        return False 