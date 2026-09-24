from sqlalchemy import Column, String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PracticeSession(Base):
    __tablename__ = "practice_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False, default=0)
    activity = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    practiced_at = Column(DateTime, nullable=False, default=utcnow)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="practice_sessions")
    skill = relationship("Skill", back_populates="practice_sessions")

    def to_dict(self, skill_name=None):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "skill_name": skill_name or (self.skill.skill_name if self.skill else None),
            "duration_minutes": self.duration_minutes,
            "activity": self.activity,
            "notes": self.notes,
            "practiced_at": self.practiced_at.isoformat() if self.practiced_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
