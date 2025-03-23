from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    password: Optional[str] = None
    created_at: Optional[datetime] = None

class UserInDB(User):
    hashed_password: Optional[str] = None 