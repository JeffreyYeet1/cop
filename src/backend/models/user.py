from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    focus_sessions = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan") 