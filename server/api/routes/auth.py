from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import logging

from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from schemas.auth import Token
from services.auth_service import authenticate_user
from core.security import create_access_token
from db.supabase import create_supabase_client

# Configure logging
logger = logging.getLogger(__name__)

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
        logger.error(f"Unexpected error during login: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        ) 