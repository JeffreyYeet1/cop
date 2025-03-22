from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class User(BaseModel):
    name: str
    email: str
    password: Optional[str] = None
    created_at: Optional[datetime] = None

class UserInDB(User):
    hashed_password: Optional[str] = None 