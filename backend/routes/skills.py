from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import SkillCreate, SkillUpdate, SkillResponse
from utils.auth import get_current_user
from models.user import User
from services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skills & Hobbies"])


@router.post("", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_in: SkillCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillService(db)
    return await service.create_skill(current_user.id, skill_in)


@router.get("", response_model=List[SkillResponse])
async def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillService(db)
    return await service.get_user_skills(current_user.id)


@router.get("/{skill_id}", response_model=SkillResponse)
async def get_skill_details(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillService(db)
    return await service.get_skill_details(skill_id, current_user.id)


@router.put("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str,
    skill_in: SkillUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillService(db)
    return await service.update_skill(skill_id, current_user.id, skill_in)


@router.delete("/{skill_id}", status_code=status.HTTP_200_OK)
async def delete_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = SkillService(db)
    await service.delete_skill(skill_id, current_user.id)
    return {"success": True, "message": "Skill deleted successfully"}
