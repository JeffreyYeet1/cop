from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.auth import Token, GoogleAuthRequest, GoogleAuthResponse
from services.auth_service import authenticate_user, create_jwt_token
from services.google_auth_service import verify_google_token
from repositories.user_repo import create_or_update_oauth_user
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
        token = create_jwt_token({"sub": user.email, "scopes": form_data.scopes})
        print("Token created successfully")
        return Token(access_token=token, token_type="bearer")
    except Exception as e:
        print(f"Error during login: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google", response_model=GoogleAuthResponse)
async def google_auth(request: GoogleAuthRequest):
    """
    Verify Google token to get user info, then sign in or create user with Supabase
    """
    try:
        # Verify Google token and get user info
        user_info = await verify_google_token(request.code, request.redirect_uri)
        if not user_info:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
        if not user_info.get('email_verified'):
            raise HTTPException(status_code=400, detail="Email not verified")

        # Try OAuth sign in first
        try:
            oauth_response = supabase.auth.sign_in_with_oauth({
                "provider": "google",
                "access_token": user_info['access_token'],
            })
            if oauth_response:
                print("Successfully signed in with OAuth")
        except Exception as e:
            print(f"OAuth sign in failed: {str(e)}")

        # Create or update user in our database
        db_user = create_or_update_oauth_user(user_info)
        if not db_user:
            raise HTTPException(status_code=400, detail="Failed to create/update user")

        # Create JWT token using the email from the dictionary
        token = create_jwt_token({"sub": db_user['email']})
        
        return GoogleAuthResponse(
            access_token=token,
            token_type="bearer",
            user=db_user  # db_user is already a dictionary as required by GoogleAuthResponse
        )

    except Exception as e:
        print(f"Google auth failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) 