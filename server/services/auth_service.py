from datetime import timedelta
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from config.settings import get_settings
from core.security import verify_password, get_password_hash, create_access_token
from crud.user import get_user, create_user, user_exists
from schemas.auth import UserCreate, User, Token

settings = get_settings()

async def authenticate_user(username: str, password: str) -> User:
    print(f"\n=== Authentication Attempt ===")
    print(f"Username: {username}")
    
    user = await get_user(username)
    if not user:
        print("User not found")
        return False
        
    if not verify_password(password, user.hashed_password):
        print("Invalid password")
        return False
        
    print("Authentication successful")
    return user

async def login_for_access_token(form_data: OAuth2PasswordRequestForm) -> Token:
    print(f"\n=== Login Attempt ===")
    print(f"Username: {form_data.username}")
    print(f"Scopes requested: {form_data.scopes}")
    
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        print("Authentication failed")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "scopes": form_data.scopes},
        expires_delta=access_token_expires,
    )
    
    print(f"Token generated successfully")
    print(f"Token: {access_token}")
    
    return Token(access_token=access_token, token_type="bearer")

async def register_user(user: UserCreate) -> dict:
    print(f"\n=== Registration Attempt ===")
    print(f"Email: {user.email}")
    print(f"Name: {user.name}")
    
    if await user_exists(user.email):
        print("User already exists")
        return {"message": "User already exists"}
    
    hashed_password = get_password_hash(user.password)
    created_user = await create_user(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    
    if not created_user:
        print("Failed to create user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    print("User created successfully")
    return {
        "message": "User created successfully",
        "user": {
            "email": created_user.email,
            "name": created_user.name
        }
    } 