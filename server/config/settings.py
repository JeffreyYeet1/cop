from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SUPABASE_URL: str
    SUPABASE_API_KEY: str
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # Frontend
        "http://localhost:8000",  # Backend
    ]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 