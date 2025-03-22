from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import auth, users, onboarding

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=False,  # We're not using cookies
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
    expose_headers=["*"],  # Exposes all headers
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"\n=== New Request ===")
    print(f"Method: {request.method}")
    print(f"URL: {request.url}")
    print(f"Headers: {dict(request.headers)}")
    try:
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise

# Include routers
app.include_router(auth.router, tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])

@app.get("/")
async def root():
    return {"message": "LangChain"} 