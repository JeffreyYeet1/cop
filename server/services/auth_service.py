from datetime import datetime, timedelta
from typing import Optional, Dict
from passlib.context import CryptContext
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from core.security import create_access_token
from repositories.user_repo import get_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def authenticate_user(db, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not user.hashed_password:  # OAuth user
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_jwt_token(data: Dict) -> str:
    """
    Create a JWT token with the given data and expiration time
    """
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return create_access_token(data=data, expires_delta=expires_delta) 