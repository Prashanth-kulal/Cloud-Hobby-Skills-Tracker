from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.goal_repo import GoalRepository
from models.goal import Goal, Milestone, GoalStatus
from schemas import GoalCreate, GoalUpdate, MilestoneCreate, MilestoneUpdate


class GoalService:
    def __init__(self, session: AsyncSession):
        self.repo = GoalRepository(session)

    async def create_goal(self, user_id: str, data: GoalCreate) -> dict:
        deadline_dt = None
        if data.deadline:
            try:
                deadline_dt = datetime.fromisoformat(data.deadline.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pass

        goal = Goal(
            user_id=user_id,
            skill_id=data.skill_id,
            title=data.title.strip(),
            target_value=data.target_value,
            current_value=data.current_value,
            unit=data.unit or "hours",
            deadline=deadline_dt,
            status=GoalStatus.ACTIVE
        )

        if data.milestones:
            for m_in in data.milestones:
                is_achieved = goal.current_value >= m_in.target_value
                m = Milestone(
                    title=m_in.title.strip(),
                    target_value=m_in.target_value,
                    achieved=is_achieved,
                    achieved_at=datetime.now(timezone.utc).replace(tzinfo=None) if is_achieved else None
                )
                goal.milestones.append(m)

        created = await self.repo.create(goal)
        # Reload with milestones
        full_goal = await self.repo.get_user_goal_by_id(created.id, user_id)
        return full_goal.to_dict() if full_goal else created.to_dict()

    async def get_user_goals(self, user_id: str, skill_id: Optional[str] = None) -> List[dict]:
        goals = await self.repo.get_user_goals(user_id, skill_id)
        return [g.to_dict() for g in goals]

    async def get_goal_details(self, goal_id: str, user_id: str) -> dict:
        goal = await self.repo.get_user_goal_by_id(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        return goal.to_dict()

    async def update_goal(self, goal_id: str, user_id: str, data: GoalUpdate) -> dict:
        goal = await self.repo.get_user_goal_by_id(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or unauthorized")

        if data.title is not None:
            goal.title = data.title.strip()
        if data.target_value is not None:
            goal.target_value = data.target_value
        if data.current_value is not None:
            goal.current_value = data.current_value
            # Check milestone achievements based on updated current_value
            for m in goal.milestones:
                if goal.current_value >= m.target_value and not m.achieved:
                    m.achieved = True
                    m.achieved_at = datetime.now(timezone.utc).replace(tzinfo=None)
                elif goal.current_value < m.target_value and m.achieved:
                    m.achieved = False
                    m.achieved_at = None

            # Auto mark goal completed if current >= target
            if goal.target_value > 0 and goal.current_value >= goal.target_value:
                goal.status = GoalStatus.COMPLETED

        if data.unit is not None:
            goal.unit = data.unit
        if data.status is not None:
            goal.status = GoalStatus(data.status.upper())
        if data.deadline is not None:
            try:
                goal.deadline = datetime.fromisoformat(data.deadline.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pass

        await self.repo.update(goal)
        refreshed = await self.repo.get_user_goal_by_id(goal_id, user_id)
        return refreshed.to_dict()

    async def delete_goal(self, goal_id: str, user_id: str) -> bool:
        goal = await self.repo.get_user_goal_by_id(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or unauthorized")
        return await self.repo.delete(goal)

    # Milestones
    async def add_milestone(self, goal_id: str, user_id: str, data: MilestoneCreate) -> dict:
        goal = await self.repo.get_user_goal_by_id(goal_id, user_id)
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found or unauthorized")

        is_achieved = goal.current_value >= data.target_value
        milestone = Milestone(
            goal_id=goal_id,
            title=data.title.strip(),
            target_value=data.target_value,
            achieved=is_achieved,
            achieved_at=datetime.now(timezone.utc).replace(tzinfo=None) if is_achieved else None
        )
        created = await self.repo.add_milestone(milestone)
        return created.to_dict()

    async def update_milestone(self, milestone_id: str, user_id: str, data: MilestoneUpdate) -> dict:
        m = await self.repo.get_milestone_by_id(milestone_id)
        if not m or not m.goal or m.goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found or unauthorized")

        if data.title is not None:
            m.title = data.title.strip()
        if data.target_value is not None:
            m.target_value = data.target_value
        if data.achieved is not None:
            m.achieved = data.achieved
            m.achieved_at = datetime.now(timezone.utc).replace(tzinfo=None) if data.achieved else None

        await self.repo.update(m)
        return m.to_dict()

    async def delete_milestone(self, milestone_id: str, user_id: str) -> bool:
        m = await self.repo.get_milestone_by_id(milestone_id)
        if not m or not m.goal or m.goal.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found or unauthorized")
        return await self.repo.delete_milestone(m)
