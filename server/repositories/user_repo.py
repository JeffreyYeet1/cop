from typing import Optional, Dict
from schemas.user import UserInDB
from db.supabase import create_supabase_client
from datetime import datetime
import json

supabase = create_supabase_client()

def get_user(db, username: str) -> Optional[UserInDB]:
    try:
        user = db.from_("users").select("*").eq("email", username).execute()
        if user.data and len(user.data) > 0:
            # Convert the password field to hashed_password for the model
            user_data = user.data[0]
            # Ensure all required fields are present with defaults
            user_data.setdefault('id', user_data.get('id'))  # Include the ID field
            user_data.setdefault('name', '')
            user_data.setdefault('email', username)
            user_data.setdefault('created_at', None)
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

def create_or_update_oauth_user(user_info: Dict) -> Optional[Dict]:
    try:
        print("\n=== Starting OAuth User Creation/Update ===")
        print(f"Input user_info: {json.dumps(user_info, indent=2)}")
        
        # Check if user exists
        print("\nChecking if user exists...")
        user = supabase.from_("users").select("*").eq("email", user_info['email']).execute()
        print(f"User query result: {json.dumps(user.data if hasattr(user, 'data') else None, indent=2)}")
        
        user_data = {
            "email": user_info['email'],
            "name": user_info.get('name', ''),
            "password": None  # OAuth users don't have a password
        }
        print(f"\nPrepared user_data: {json.dumps(user_data, indent=2)}")

        try:
            if not user.data:
                print("\nAttempting to create new user...")
                result = supabase.from_("users").insert(user_data).execute()
                print(f"Insert result: {json.dumps(result.data if hasattr(result, 'data') else None, indent=2)}")
            else:
                print("\nAttempting to update existing user...")
                result = supabase.from_("users").update(user_data).eq("email", user_info['email']).execute()
                print(f"Update result: {json.dumps(result.data if hasattr(result, 'data') else None, indent=2)}")

            if result.data:
                print("\nSuccessfully processed user.")
                return result.data[0]  # Return the raw dictionary from the database
            else:
                print("\nNo data returned from database operation")
                return None

        except Exception as db_error:
            print(f"\nDatabase operation error: {str(db_error)}")
            print(f"Error type: {type(db_error)}")
            import traceback
            print(f"Traceback:\n{traceback.format_exc()}")
            raise

    except Exception as e:
        print("\n=== OAuth User Creation/Update Failed ===")
        print(f"Error type: {type(e)}")
        print(f"Error message: {str(e)}")
        import traceback
        print(f"Traceback:\n{traceback.format_exc()}")
        return None 