from supabase import Client, create_client
from config.settings import get_settings

settings = get_settings()

def create_supabase_client() -> Client:
    supabase: Client = create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_API_KEY
    )
    return supabase
