from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import logging

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.auth import Token, GoogleAuthRequest, GoogleAuthResponse
from services.auth_service import authenticate_user, create_jwt_token
from services.google_auth_service import verify_google_token
from repositories.user_repo import create_or_update_oauth_user
from db.supabase import create_supabase_client

# Configure logging
logger = logging.getLogger(__name__)
from services.token_service import TokenService

router = APIRouter()
supabase = create_supabase_client()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    try:
        logger.info(f"Login attempt for email: {form_data.username}")
        logger.debug(f"Requested scopes: {form_data.scopes}")
        
        user = authenticate_user(supabase, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Authentication failed for email: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        print("Authentication successful, creating token")
        token = create_jwt_token({"sub": user.email, "scopes": form_data.scopes})
        print("Token created successfully")
        return Token(access_token=token, token_type="bearer")
        logger.info(f"Authentication successful for user: {user.email}")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        # Log token creation details
        logger.debug(f"Creating token with expiry: {access_token_expires}")
        
        # Ensure consistent scope handling
        scopes = form_data.scopes if form_data.scopes else ["me"]
        if "me" not in scopes:  # Always include "me" scope
            scopes.append("me")
            
        token_data = {
            "sub": user.email,
            "scopes": scopes
        }
        logger.debug(f"Token payload: {token_data}")
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires,
        )
        
        logger.info(f"Token created successfully for user: {user.email}")
        logger.debug(f"Token length: {len(access_token)}")
        return Token(access_token=access_token, token_type="bearer")
        
    except HTTPException as e:
        logger.error(f"HTTP error during login: {str(e)}")
        raise e
    except Exception as e:
        print(f"Error during login: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/google", response_model=GoogleAuthResponse)
async def google_auth(request: Request, auth_request: GoogleAuthRequest):
    """
    Verify Google token to get user info, then sign in or create user with Supabase
    """
    try:
        # Verify Google token and get user info
        user_info = await verify_google_token(auth_request.code, auth_request.redirect_uri)
        if not user_info:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
        if not user_info.get('email_verified'):
            raise HTTPException(status_code=400, detail="Email not verified")

        # Store the Google OAuth token in the session
        TokenService.store_token(request, user_info['access_token'])

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
            user=db_user
        )

    except Exception as e:
        print(f"Google auth failed: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/token")
async def get_token(request: Request):
    """Get the Google OAuth token for the current user."""
    try:
        token = TokenService.get_token(request)
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        return {"access_token": token}
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        ) 