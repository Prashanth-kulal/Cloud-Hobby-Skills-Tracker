from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class SkillLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"


class SkillStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    skill_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    current_level = Column(Enum(SkillLevel), default=SkillLevel.BEGINNER)
    target_level = Column(Enum(SkillLevel), default=SkillLevel.INTERMEDIATE)
    start_date = Column(DateTime, default=utcnow)
    target_date = Column(DateTime, nullable=True)
    status = Column(Enum(SkillStatus), default=SkillStatus.ACTIVE)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="skills")
    goals = relationship("Goal", back_populates="skill", cascade="all, delete-orphan")
    practice_sessions = relationship("PracticeSession", back_populates="skill", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="skill")

    def to_dict(self, total_minutes=0):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_name": self.skill_name,
            "category": self.category,
            "current_level": self.current_level.value if self.current_level else "BEGINNER",
            "target_level": self.target_level.value if self.target_level else "INTERMEDIATE",
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "target_date": self.target_date.isoformat() if self.target_date else None,
            "status": self.status.value if self.status else "ACTIVE",
            "description": self.description,
            "total_practice_minutes": total_minutes,
            "total_practice_hours": round(total_minutes / 60, 1),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
