from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Security

from schemas.user import User
from repositories.user_repo import user_exists
from api.dependencies import get_current_active_user
from db.supabase import create_supabase_client

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
def create_user(user: User):
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
            return {"message": "User already exists"}
        print("User does not exist, proceeding with creation")
        
        # TODO: Add actual user creation logic here
        return {"message": "User creation endpoint"}
    except Exception as e:
        return {"error": str(e)} 