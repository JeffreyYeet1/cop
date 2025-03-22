from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Security
from schemas.user import User
from repositories.user_repo import user_exists
from api.dependencies import get_current_active_user
from db.supabase import create_supabase_client
from core.security import get_password_hash

router = APIRouter()
supabase = create_supabase_client()

@router.get("/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user

@router.get("/me/items/")
async def read_own_items(
    current_user: Annotated[User, Security(get_current_active_user, scopes=["items"])],
):
    return [{"item_id": "Foo", "owner": current_user.username}]

@router.post("/")
async def create_user(user: User):
    try:
        print("Starting user creation process...")
        print(f"Received user data: {user.dict(exclude={'password'})}")
        
        # Convert email to lowercase
        user_email = user.email.lower()
        print(f"Normalized email: {user_email}")

        # Check if user already exists
        print("Checking if user exists...")
        if user_exists(value=user_email):
            print(f"User with email {user_email} already exists")
            raise HTTPException(
                status_code=400,
                detail="User already exists"
            )
        
        print("User does not exist, proceeding with creation")
        
        # Hash the password
        hashed_password = get_password_hash(user.password)
        
        # Create user in database with only the required fields
        result = supabase.from_("users").insert({
            "email": user_email,
            "name": user.name,
            "password": hashed_password
        }).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to create user account"
            )
            
        print("User created successfully")
        return {"message": "User created successfully"}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user account: {str(e)}"
        ) 