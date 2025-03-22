from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.auth import Token
from services.auth_service import authenticate_user
from core.security import create_access_token
from db.supabase import create_supabase_client

router = APIRouter()
supabase = create_supabase_client()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    try:
        print(f"Login attempt for email: {form_data.username}")
        user = authenticate_user(supabase, form_data.username, form_data.password)
        if not user:
            print("Authentication failed: Invalid credentials")
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        print("Authentication successful, creating token")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "scopes": form_data.scopes},
            expires_delta=access_token_expires,
        )
        print("Token created successfully")
        return Token(access_token=access_token, token_type="bearer")
    except Exception as e:
        print(f"Error during login: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e)) 