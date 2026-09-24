from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.practice import PracticeSession
from repositories.base import BaseRepository


class PracticeRepository(BaseRepository[PracticeSession]):
    def __init__(self, session: AsyncSession):
        super().__init__(PracticeSession, session)

    async def get_user_practice_sessions(
        self, user_id: str, skill_id: Optional[str] = None, limit: int = 100
    ) -> List[PracticeSession]:
        stmt = (
            select(PracticeSession)
            .options(selectinload(PracticeSession.skill))
            .where(PracticeSession.user_id == user_id)
        )
        if skill_id:
            stmt = stmt.where(PracticeSession.skill_id == skill_id)
        stmt = stmt.order_by(PracticeSession.practiced_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_practice_by_id(self, practice_id: str, user_id: str) -> Optional[PracticeSession]:
        stmt = select(PracticeSession).where(
            PracticeSession.id == practice_id, PracticeSession.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
