from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import SecurityScopes
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging

from database import get_db
from models.focus_session import FocusSession
from schemas.focus_session import FocusSessionCreate, FocusSessionUpdate, FocusSessionResponse
from auth.dependencies import get_current_user
from schemas.user import User

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/focus",
    tags=["focus"],
)

@router.post("/sessions", response_model=FocusSessionResponse)
async def create_focus_session(
    session_data: FocusSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Security(get_current_user, scopes=["user"])
):
    """Start a new focus session"""
    try:
        # Validate planned duration
        if session_data.planned_duration <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Planned duration must be positive"
            )
            
        new_session = FocusSession(
            user_id=current_user.id,
            task_id=session_data.task_id,
            planned_duration=session_data.planned_duration,
        )
        
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating focus session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create focus session: {str(e)}"
        )

@router.put("/sessions/{session_id}", response_model=FocusSessionResponse)
async def end_focus_session(
    session_id: int,
    session_data: FocusSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Security(get_current_user, scopes=["user"])
):
    """End an existing focus session"""
    try:
        # Validate actual duration
        if session_data.actual_duration < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Actual duration cannot be negative"
            )
            
        session = db.query(FocusSession).filter(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Focus session not found"
            )
        
        # Update session with end time and actual duration
        session.end_time = session_data.end_time
        session.actual_duration = session_data.actual_duration
        
        db.commit()
        db.refresh(session)
        return session
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating focus session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update focus session: {str(e)}"
        )

@router.get("/sessions", response_model=List[FocusSessionResponse])
async def get_user_focus_sessions(
    db: Session = Depends(get_db),
    current_user: User = Security(get_current_user, scopes=["user"]),
    limit: int = 10,
    offset: int = 0
):
    """Get the user's focus sessions"""
    try:
        sessions = db.query(FocusSession).filter(
            FocusSession.user_id == current_user.id
        ).order_by(FocusSession.start_time.desc()).offset(offset).limit(limit).all()
        
        return sessions
    except Exception as e:
        logger.error(f"Error fetching focus sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch focus sessions: {str(e)}"
        )

@router.get("/sessions/{session_id}", response_model=FocusSessionResponse)
async def get_focus_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Security(get_current_user, scopes=["user"])
):
    """Get a specific focus session"""
    try:
        session = db.query(FocusSession).filter(
            FocusSession.id == session_id,
            FocusSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Focus session not found"
            )
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching focus session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch focus session: {str(e)}"
        ) 