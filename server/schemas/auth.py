from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []

class GoogleAuthRequest(BaseModel):
    code: str
    redirect_uri: str

class GoogleAuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict 