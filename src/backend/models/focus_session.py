from sqlalchemy import Column, BigInteger, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    task_id = Column(BigInteger, ForeignKey("tasks.id"), nullable=True)  # Optional task association
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)  # Null until session ends
    planned_duration = Column(BigInteger, nullable=False)  # Duration in seconds
    actual_duration = Column(BigInteger, nullable=True)  # Null until session ends
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="focus_sessions")
    task = relationship("Task", back_populates="focus_sessions") 