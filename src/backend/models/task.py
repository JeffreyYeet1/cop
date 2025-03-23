from sqlalchemy.orm import relationship

class Task:
    focus_sessions = relationship("FocusSession", back_populates="task") 