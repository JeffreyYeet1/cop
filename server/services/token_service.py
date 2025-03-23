from fastapi import Request
from typing import Optional

class TokenService:
    @staticmethod
    def store_token(request: Request, token: str) -> None:
        """Store the Google OAuth token in the session."""
        if "tokens" not in request.session:
            request.session["tokens"] = {}
        request.session["tokens"]["google"] = token

    @staticmethod
    def get_token(request: Request) -> Optional[str]:
        """Get the Google OAuth token from the session."""
        if "tokens" not in request.session:
            return None
        return request.session["tokens"].get("google")

    @staticmethod
    def remove_token(request: Request) -> None:
        """Remove the Google OAuth token from the session."""
        if "tokens" in request.session:
            request.session["tokens"].pop("google", None) 