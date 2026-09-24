from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class GoalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    PAUSED = "PAUSED"


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id"), nullable=True, index=True)
    title = Column(String(500), nullable=False)
    target_value = Column(Float, nullable=False, default=0)
    current_value = Column(Float, nullable=False, default=0)
    unit = Column(String(50), nullable=False, default="hours")
    deadline = Column(DateTime, nullable=True)
    status = Column(Enum(GoalStatus), default=GoalStatus.ACTIVE)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="goals")
    skill = relationship("Skill", back_populates="goals")
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")

    @property
    def progress_percent(self):
        if self.target_value <= 0:
            return 0
        pct = (self.current_value / self.target_value) * 100
        return min(round(pct, 1), 100.0)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "skill_id": self.skill_id,
            "title": self.title,
            "target_value": self.target_value,
            "current_value": self.current_value,
            "unit": self.unit,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "status": self.status.value if self.status else "ACTIVE",
            "progress_percent": self.progress_percent,
            "milestones": [m.to_dict() for m in self.milestones] if self.milestones else [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id = Column(String(36), ForeignKey("goals.id"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    target_value = Column(Float, nullable=False, default=0)
    achieved = Column(Boolean, default=False)
    achieved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    goal = relationship("Goal", back_populates="milestones")

    def to_dict(self):
        return {
            "id": self.id,
            "goal_id": self.goal_id,
            "title": self.title,
            "target_value": self.target_value,
            "achieved": self.achieved,
            "achieved_at": self.achieved_at.isoformat() if self.achieved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
