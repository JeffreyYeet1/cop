from sqlalchemy import Boolean, Column, String, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=False)
    disabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    onboarding = relationship("OnboardingAnswer", back_populates="user", uselist=False)

class OnboardingAnswer(Base):
    __tablename__ = "onboarding_answers"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    answers = Column(ARRAY(String), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationship
    user = relationship("User", back_populates="onboarding") 