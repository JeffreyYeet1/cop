from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from core.security import get_current_active_user
from schemas.auth import User, UserCreate, Token
from services.auth_service import login_for_access_token, register_user

router = APIRouter()

@router.post("/signin", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    print("\n" + "="*50)
    print("LOGIN REQUEST RECEIVED")
    print("="*50)
    print(f"Username: {form_data.username}")
    print(f"Scopes: {form_data.scopes}")
    
    try:
        token = await login_for_access_token(form_data)
        print("\n" + "="*50)
        print("TOKEN GENERATED SUCCESSFULLY")
        print("="*50)
        print(f"Token: {token.access_token}")
        print("="*50 + "\n")
        return token
    except Exception as e:
        print("\n" + "="*50)
        print("LOGIN FAILED")
        print("="*50)
        print(f"Error: {str(e)}")
        print("="*50 + "\n")
        raise

@router.post("/signup", response_model=dict)
async def create_user(user: UserCreate) -> dict:
    print("\n" + "="*50)
    print("REGISTRATION REQUEST RECEIVED")
    print("="*50)
    print(f"Email: {user.email}")
    print(f"Name: {user.name}")
    
    try:
        result = await register_user(user)
        print("\n" + "="*50)
        print("REGISTRATION SUCCESSFUL")
        print("="*50)
        print(f"Result: {result}")
        print("="*50 + "\n")
        return result
    except Exception as e:
        print("\n" + "="*50)
        print("REGISTRATION FAILED")
        print("="*50)
        print(f"Error: {str(e)}")
        print("="*50 + "\n")
        raise

@router.get("/me", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    print("\n" + "="*50)
    print("GET CURRENT USER REQUEST")
    print("="*50)
    print(f"User email: {current_user.email}")
    print("="*50 + "\n")
    return current_user 