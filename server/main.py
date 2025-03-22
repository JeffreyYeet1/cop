from datetime import datetime, timedelta, timezone
from typing import Annotated
from db.supabase import create_supabase_client
import os
import bcrypt
from dotenv import load_dotenv
load_dotenv()

import jwt
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm,
    SecurityScopes,
)
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import BaseModel, ValidationError
from fastapi.middleware.cors import CORSMiddleware

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None
    scopes: list[str] = []


class User(BaseModel):
    name: str
    email: str
    password: str | None = None
    created_at: datetime | None = None


class UserInDB(User):
    hashed_password: str | None = None


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="token",
    scopes={"me": "Read information about the current user.", "items": "Read items."},
)

app = FastAPI()
supabase = create_supabase_client()

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

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    user = db.from_("users").select("*").eq("email", username).execute()
    if user.data:
        # Convert the password field to hashed_password for the model
        user_data = user.data[0]
        user_data['hashed_password'] = user_data.pop('password', None)
        return UserInDB(**user_data)
    return None


def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def user_exists(key: str = "email", value: str = None):
    user = supabase.from_("users").select("*").eq(key, value).execute()
    return len(user.data) > 0

async def get_current_user(
    security_scopes: SecurityScopes, token: Annotated[str, Depends(oauth2_scheme)]
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = TokenData(scopes=token_scopes, username=username)
    except (InvalidTokenError, ValidationError):
        raise credentials_exception
    user = get_user(supabase, username=token_data.username)
    if user is None:
        raise credentials_exception
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not enough permissions",
                headers={"WWW-Authenticate": authenticate_value},
            )
    return user


async def get_current_active_user(
    current_user: Annotated[User, Security(get_current_user, scopes=["me"])],
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user



@app.get("/")
async def root():
    return {"message": "LangChain"}


@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    try:
        print(f"Login attempt for email: {form_data.username}")
        # Convert form_data.username to email since we're using email for authentication
        user = authenticate_user(supabase, form_data.username, form_data.password)
        if not user:
            print("Authentication failed: Invalid credentials")
            raise HTTPException(status_code=400, detail="Incorrect email or password")
        
        print("Authentication successful, creating token")
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "scopes": form_data.scopes},
            expires_delta=access_token_expires,
        )
        print("Token created successfully")
        return Token(access_token=access_token, token_type="bearer")
    except Exception as e:
        print(f"Error during login: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    return current_user


@app.get("/users/me/items/")
async def read_own_items(
    current_user: Annotated[User, Security(get_current_active_user, scopes=["items"])],
):
    return [{"item_id": "Foo", "owner": current_user.username}]

# Create a new user
@app.post("/user")
def create_user(user: User):
    try:
        print("Starting user creation process...")
        print(f"Received user data: {user.dict(exclude={'password'})}")
        
        # Convert email to lowercase
        user_email = user.email.lower()
        print(f"Normalized email: {user_email}")

        # Check if user already exists
        print("Checking if user exists...")
        if user_exists(value=user_email):
            print(f"User with email {user_email} already exists")
            return {"message": "User already exists"}
        print("User does not exist, proceeding with creation")

        # Hash the password
        hashed_password = get_password_hash(user.password)
        print("Password hashed successfully")

        # Create user directly in the public users table
        print("Creating user in public table...")
        user_data = {
            "email": user_email,
            "name": user.name,
            "password": hashed_password,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        insert_response = supabase.from_("users").insert(user_data).execute()
        print(f"Insert response: {insert_response}")
        
        if insert_response.data:
            print("User created successfully")
            return {
                "message": "User created successfully",
                "user": {
                    "email": user_email,
                    "name": user.name
                }
            }
        else:
            print("Failed to create user record")
            return {"message": "Failed to create user record"}
            
    except Exception as e:
        print(f"Error during user creation: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {"message": f"User creation failed: {str(e)}"}
        
@app.get("/status/")
async def read_system_status(current_user: Annotated[User, Depends(get_current_user)]):
    return {"status": "ok"}