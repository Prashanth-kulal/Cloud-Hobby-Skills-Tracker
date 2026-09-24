from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.skill import Skill
from models.practice import PracticeSession
from sqlalchemy import func
from repositories.base import BaseRepository


class SkillRepository(BaseRepository[Skill]):
    def __init__(self, session: AsyncSession):
        super().__init__(Skill, session)

    async def get_user_skills(self, user_id: str) -> List[Skill]:
        result = await self.session.execute(
            select(Skill).where(Skill.user_id == user_id).order_by(Skill.created_at.desc())
        )
        return result.scalars().all()

    async def get_user_skill_by_id(self, skill_id: str, user_id: str) -> Optional[Skill]:
        result = await self.session.execute(
            select(Skill).where(Skill.id == skill_id, Skill.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_skill_total_practice(self, skill_id: str) -> int:
        result = await self.session.execute(
            select(func.coalesce(func.sum(PracticeSession.duration_minutes), 0))
            .where(PracticeSession.skill_id == skill_id)
        )
        return result.scalar() or 0
