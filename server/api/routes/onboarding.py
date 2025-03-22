from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException
from schemas.onboarding import OnboardingPreferences
from schemas.user import User
from api.dependencies import get_current_active_user
from db.supabase import create_supabase_client

router = APIRouter()
supabase = create_supabase_client()

async def get_user_id_by_email(email: str) -> int:
    try:
        # Get the user's ID from the users table
        result = supabase.from_("users").select("id").eq("email", email).execute()
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return result.data[0]["id"]
    except Exception as e:
        print(f"Error getting user ID: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get user ID: {str(e)}")

@router.post("/preferences")
async def save_onboarding_preferences(
    preferences: OnboardingPreferences,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    try:
        print(f"Saving preferences for user: {current_user.email}")
        print(f"Preferences data: {preferences.dict()}")
        
        # Get the numeric user ID
        user_id = await get_user_id_by_email(current_user.email)
        print(f"Found user ID: {user_id}")
        
        # Format the data for Supabase
        preference_data = {
            "user_id": user_id,  # Using numeric ID instead of email
            "preferences": [pref.dict() for pref in preferences.preferences]
        }
        print(f"Formatted data for database: {preference_data}")
        
        # Save preferences to database
        result = supabase.from_("user_preferences").upsert(preference_data).execute()
        print(f"Database response: {result}")
        
        return {"message": "Preferences saved successfully"}
    except Exception as e:
        print(f"Error saving preferences: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save preferences: {str(e)}"
        )

@router.get("/preferences", response_model=OnboardingPreferences)
async def get_onboarding_preferences(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    try:
        print(f"Getting preferences for user: {current_user.email}")
        
        # Get the numeric user ID
        user_id = await get_user_id_by_email(current_user.email)
        print(f"Found user ID: {user_id}")
        
        # Get preferences from database
        result = supabase.from_("user_preferences").select("*").eq("user_id", user_id).execute()
        print(f"Database response: {result}")
        
        if not result.data:
            print("No preferences found, returning empty list")
            return OnboardingPreferences(preferences=[])
        
        print(f"Found preferences: {result.data[0]}")
        return OnboardingPreferences(preferences=result.data[0]["preferences"])
    except Exception as e:
        print(f"Error getting preferences: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get preferences: {str(e)}"
        ) 