from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.file_model import FileRecord
from repositories.base import BaseRepository


class FileRepository(BaseRepository[FileRecord]):
    def __init__(self, session: AsyncSession):
        super().__init__(FileRecord, session)

    async def get_user_files(self, user_id: str) -> List[FileRecord]:
        stmt = (
            select(FileRecord)
            .where(FileRecord.user_id == user_id)
            .order_by(FileRecord.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_file_by_id(self, file_id: str, user_id: str) -> Optional[FileRecord]:
        stmt = select(FileRecord).where(
            FileRecord.id == file_id, FileRecord.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
