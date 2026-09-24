from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.practice_repo import PracticeRepository
from repositories.skill_repo import SkillRepository
from repositories.goal_repo import GoalRepository
from models.practice import PracticeSession
from models.goal import GoalStatus
from schemas import PracticeCreate
from analytics.progress_service import ProgressService


class PracticeService:
    def __init__(self, session: AsyncSession):
        self.repo = PracticeRepository(session)
        self.skill_repo = SkillRepository(session)
        self.goal_repo = GoalRepository(session)

    async def log_practice(self, user_id: str, data: PracticeCreate) -> dict:
        # Validate skill belongs to user
        skill = await self.skill_repo.get_user_skill_by_id(data.skill_id, user_id)
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")

        practiced_dt = datetime.now(timezone.utc).replace(tzinfo=None)
        if data.practiced_at:
            try:
                practiced_dt = datetime.fromisoformat(data.practiced_at.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pass

        session = PracticeSession(
            user_id=user_id,
            skill_id=data.skill_id,
            duration_minutes=data.duration_minutes,
            activity=data.activity or "Practice session",
            notes=data.notes,
            practiced_at=practiced_dt
        )
        created = await self.repo.create(session)

        # Automatically update any active goals for this skill
        goals = await self.goal_repo.get_user_goals(user_id, skill_id=data.skill_id)
        hours_added = data.duration_minutes / 60.0
        for g in goals:
            if g.status == GoalStatus.ACTIVE:
                if g.unit.lower() in ["hour", "hours", "hr", "hrs"]:
                    g.current_value = round(g.current_value + hours_added, 2)
                elif g.unit.lower() in ["minute", "minutes", "min", "mins"]:
                    g.current_value = round(g.current_value + data.duration_minutes, 1)

                # Check milestones
                for m in g.milestones:
                    if g.current_value >= m.target_value and not m.achieved:
                        m.achieved = True
                        m.achieved_at = datetime.now(timezone.utc).replace(tzinfo=None)

                if g.target_value > 0 and g.current_value >= g.target_value:
                    g.status = GoalStatus.COMPLETED

                await self.goal_repo.update(g)

        return created.to_dict(skill_name=skill.skill_name)

    async def get_practice_history(
        self, user_id: str, skill_id: Optional[str] = None, limit: int = 100
    ) -> List[dict]:
        sessions = await self.repo.get_user_practice_sessions(user_id, skill_id, limit)
        return [s.to_dict() for s in sessions]

    async def get_practice_summary(self, user_id: str) -> Dict[str, Any]:
        sessions = await self.repo.get_user_practice_sessions(user_id, limit=500)
        return ProgressService.compute_practice_aggregates(sessions)

    async def delete_practice(self, practice_id: str, user_id: str) -> bool:
        session = await self.repo.get_user_practice_by_id(practice_id, user_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Practice session not found or unauthorized")
        return await self.repo.delete(session)
