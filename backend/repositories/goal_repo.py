from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from models.goal import Goal, Milestone
from repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    def __init__(self, session: AsyncSession):
        super().__init__(Goal, session)

    async def get_user_goals(self, user_id: str, skill_id: Optional[str] = None) -> List[Goal]:
        stmt = select(Goal).options(selectinload(Goal.milestones)).where(Goal.user_id == user_id)
        if skill_id:
            stmt = stmt.where(Goal.skill_id == skill_id)
        stmt = stmt.order_by(Goal.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_user_goal_by_id(self, goal_id: str, user_id: str) -> Optional[Goal]:
        stmt = select(Goal).options(selectinload(Goal.milestones)).where(
            Goal.id == goal_id, Goal.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def add_milestone(self, milestone: Milestone) -> Milestone:
        self.session.add(milestone)
        await self.session.commit()
        await self.session.refresh(milestone)
        return milestone

    async def get_milestone_by_id(self, milestone_id: str) -> Optional[Milestone]:
        stmt = select(Milestone).options(selectinload(Milestone.goal)).where(Milestone.id == milestone_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_milestone(self, milestone: Milestone) -> bool:
        await self.session.delete(milestone)
        await self.session.commit()
        return True
