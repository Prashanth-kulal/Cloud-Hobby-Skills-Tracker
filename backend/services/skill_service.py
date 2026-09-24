from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.skill_repo import SkillRepository
from models.skill import Skill, SkillLevel, SkillStatus
from schemas import SkillCreate, SkillUpdate


class SkillService:
    def __init__(self, session: AsyncSession):
        self.repo = SkillRepository(session)

    async def create_skill(self, user_id: str, data: SkillCreate) -> dict:
        def parse_date(d_str):
            if not d_str:
                return None
            try:
                return datetime.fromisoformat(d_str.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                return None

        skill = Skill(
            user_id=user_id,
            skill_name=data.skill_name.strip(),
            category=data.category or "General",
            current_level=SkillLevel(data.current_level.upper()) if data.current_level else SkillLevel.BEGINNER,
            target_level=SkillLevel(data.target_level.upper()) if data.target_level else SkillLevel.INTERMEDIATE,
            start_date=parse_date(data.start_date) or datetime.now(timezone.utc).replace(tzinfo=None),
            target_date=parse_date(data.target_date),
            description=data.description
        )
        created = await self.repo.create(skill)
        return created.to_dict(total_minutes=0)

    async def get_user_skills(self, user_id: str) -> List[dict]:
        skills = await self.repo.get_user_skills(user_id)
        result = []
        for s in skills:
            total_mins = await self.repo.get_skill_total_practice(s.id)
            result.append(s.to_dict(total_minutes=total_mins))
        return result

    async def get_skill_details(self, skill_id: str, user_id: str) -> dict:
        skill = await self.repo.get_user_skill_by_id(skill_id, user_id)
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        total_mins = await self.repo.get_skill_total_practice(skill.id)
        return skill.to_dict(total_minutes=total_mins)

    async def update_skill(self, skill_id: str, user_id: str, data: SkillUpdate) -> dict:
        skill = await self.repo.get_user_skill_by_id(skill_id, user_id)
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found or unauthorized")

        if data.skill_name is not None:
            skill.skill_name = data.skill_name.strip()
        if data.category is not None:
            skill.category = data.category
        if data.current_level is not None:
            skill.current_level = SkillLevel(data.current_level.upper())
        if data.target_level is not None:
            skill.target_level = SkillLevel(data.target_level.upper())
        if data.status is not None:
            skill.status = SkillStatus(data.status.upper())
        if data.description is not None:
            skill.description = data.description
        if data.target_date is not None:
            try:
                skill.target_date = datetime.fromisoformat(data.target_date.replace("Z", "+00:00")).replace(tzinfo=None)
            except Exception:
                pass

        updated = await self.repo.update(skill)
        total_mins = await self.repo.get_skill_total_practice(updated.id)
        return updated.to_dict(total_minutes=total_mins)

    async def delete_skill(self, skill_id: str, user_id: str) -> bool:
        skill = await self.repo.get_user_skill_by_id(skill_id, user_id)
        if not skill:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found or unauthorized")
        return await self.repo.delete(skill)
