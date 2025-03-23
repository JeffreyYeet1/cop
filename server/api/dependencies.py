from typing import Annotated, Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import OAuth2PasswordBearer, SecurityScopes
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from pydantic import ValidationError
import jwt
import logging

from core.config import SECRET_KEY, ALGORITHM
from schemas.auth import TokenData
from schemas.user import User
from repositories.user_repo import get_user
from db.supabase import create_supabase_client

# Configure logging
logger = logging.getLogger(__name__)

supabase = create_supabase_client()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token",
    scopes={"me": "Read information about the current user.", "items": "Read items."},
)

async def get_current_user(
    security_scopes: SecurityScopes, token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    logger.info("Starting user authentication")
    logger.debug(f"Security scopes: {security_scopes.scopes}")
    logger.debug(f"Token length: {len(token)}")
    
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    
    try:
        # Decode JWT token
        logger.debug("Attempting to decode JWT token")
        logger.debug(f"Using algorithm: {ALGORITHM}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug(f"Token payload: {payload}")
        
        email: Optional[str] = payload.get("sub")
        if email is None:
            logger.error("No email found in token payload")
            raise credentials_exception
        
        # Get token scopes
        token_scopes = payload.get("scopes", [])
        logger.debug(f"Token scopes: {token_scopes}")
        token_data = TokenData(scopes=token_scopes, username=email)
        logger.debug(f"Token data: {token_data}")
        
        # Get user from database - using email as username parameter
        logger.info(f"Fetching user from database: {email}")
        user = get_user(supabase, username=email)  # Using email as username parameter
        if user is None:
            logger.error(f"User not found in database: {email}")
            raise credentials_exception
            
        # Check scopes
        logger.debug(f"Checking required scopes: {security_scopes.scopes}")
        for scope in security_scopes.scopes:
            if scope not in token_data.scopes:
                logger.error(f"User {email} missing required scope: {scope}")
                logger.error(f"User has scopes: {token_data.scopes}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not enough permissions",
                    headers={"WWW-Authenticate": authenticate_value},
                )
        
        logger.info(f"Successfully authenticated user: {email}")
        logger.debug(f"User details: {user}")
        return user
        
    except ExpiredSignatureError as e:
        logger.error(f"Token has expired: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": authenticate_value},
        )
    except InvalidTokenError as e:
        logger.error(f"Invalid token error: {str(e)}")
        raise credentials_exception
    except ValidationError as e:
        logger.error(f"Token data validation error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Unexpected error in get_current_user: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during authentication: {str(e)}"
        )

async def get_current_active_user(
    current_user: Annotated[User, Security(get_current_user)],
) -> User:
    logger.info(f"Getting active user: {current_user.email}")
    logger.debug(f"Active user details: {current_user}")
    return current_user 