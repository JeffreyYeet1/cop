from typing import Optional
from schemas.user import UserInDB
from db.supabase import create_supabase_client

supabase = create_supabase_client()

def get_user(db, username: str) -> Optional[UserInDB]:
    try:
        user = db.from_("users").select("*").eq("email", username).execute()
        if user.data and len(user.data) > 0:
            # Convert the password field to hashed_password for the model
            user_data = user.data[0]
            # Ensure all required fields are present with defaults
            user_data.setdefault('name', '')
            user_data.setdefault('email', username)
            user_data.setdefault('created_at', None)
            user_data.setdefault('disabled', False)
            # Convert password to hashed_password
            user_data['hashed_password'] = user_data.pop('password', None)
            return UserInDB(**user_data)
        return None
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return None

def user_exists(key: str = "email", value: str = None) -> bool:
    try:
        user = supabase.from_("users").select("*").eq(key, value).execute()
        return len(user.data) > 0
    except Exception as e:
        print(f"Error checking user existence: {str(e)}")
        return False 