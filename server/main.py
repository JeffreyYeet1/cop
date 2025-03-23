from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from api.routes import auth, users, onboarding, todo, peka, calendar
import logging
from dotenv import load_dotenv
import os
import secrets

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Debug logging for environment variables
logger.info("Loading environment variables...")
cohere_key = os.getenv("COHERE_API_KEY")
logger.info(f"Cohere API key loaded: {'Found' if cohere_key else 'Not found'}")

app = FastAPI(title="Peka API")

# Configure session middleware with a secure secret key
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", secrets.token_urlsafe(32)),
    session_cookie="session",
    max_age=60 * 60 * 24 * 7,  # 7 days
    same_site="lax",
    https_only=False  # Set to True in production
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info("=== New Request ===")
    logger.debug(f"Method: {request.method}")
    logger.debug(f"URL: {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        logger.exception("Full traceback:")
        raise

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(todo.router, prefix="/api/todo", tags=["todo"])
app.include_router(peka.router, prefix="/api/peka", tags=["peka"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["calendar"])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Peka API"} 