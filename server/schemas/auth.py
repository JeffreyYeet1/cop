from datetime import datetime
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str | None = None
    created_at: datetime | None = None
    disabled: bool = False

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str | None = None 