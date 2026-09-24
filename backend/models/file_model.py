from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from database import Base


def utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class FileRecord(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String(500), nullable=False)
    file_type = Column(String(100), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    file_url = Column(String(1000), nullable=True)
    file_category = Column(String(100), nullable=True)  # profile, achievement, post
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="files")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "file_name": self.file_name,
            "file_type": self.file_type,
            "storage_path": self.storage_path,
            "file_url": self.file_url,
            "file_category": self.file_category,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
