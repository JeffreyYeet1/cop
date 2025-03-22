import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
api = os.getenv("SUPABASE_API_KEY") 