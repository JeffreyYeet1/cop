from google.oauth2 import id_token
from google.auth.transport import requests
import httpx
from fastapi import HTTPException
from core.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

async def verify_google_token(code: str, redirect_uri: str):
    try:
        print(f"Starting Google token verification with redirect URI: {redirect_uri}")
        
        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code"
        }

        print("Making token exchange request to Google")
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            print(f"Google token response status: {token_response.status_code}")
            
            if token_response.status_code != 200:
                error_text = token_response.text
                print(f"Google token exchange failed. Response: {error_text}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to verify Google token: {error_text}"
                )
            
            token_info = token_response.json()
            print("Successfully received token from Google")

            try:
                print("Verifying ID token")
                id_info = id_token.verify_oauth2_token(
                    token_info['id_token'],
                    requests.Request(),
                    GOOGLE_CLIENT_ID
                )
                print("ID token verified successfully")
            except Exception as e:
                print(f"Error verifying ID token: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid ID token: {str(e)}"
                )

            if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                print(f"Invalid token issuer: {id_info['iss']}")
                raise HTTPException(status_code=400, detail="Invalid token issuer")

            user_info = {
                "email": id_info['email'],
                "name": id_info.get('name'),
                "picture": id_info.get('picture'),
                "email_verified": id_info.get('email_verified', False),
                "access_token": token_info['access_token']
            }
            print(f"Successfully verified Google token for user: {user_info['email']}")
            return user_info

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in verify_google_token: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=400,
            detail=f"Error verifying Google token: {str(e)}"
        ) 