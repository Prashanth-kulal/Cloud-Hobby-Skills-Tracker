from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import PracticeCreate, PracticeResponse
from utils.auth import get_current_user
from models.user import User
from services.practice_service import PracticeService

router = APIRouter(tags=["Practice Tracking"])


@router.post("/practice", response_model=PracticeResponse, status_code=status.HTTP_201_CREATED)
async def log_practice(
    practice_in: PracticeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PracticeService(db)
    return await service.log_practice(current_user.id, practice_in)


@router.get("/practice", response_model=List[PracticeResponse])
async def get_practice_history(
    skill_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PracticeService(db)
    return await service.get_practice_history(current_user.id, skill_id=skill_id, limit=limit)


@router.get("/skills/{skill_id}/practice", response_model=List[PracticeResponse])
async def get_skill_practice(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PracticeService(db)
    return await service.get_practice_history(current_user.id, skill_id=skill_id)


@router.get("/practice/summary")
async def get_practice_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PracticeService(db)
    return await service.get_practice_summary(current_user.id)


@router.delete("/practice/{practice_id}", status_code=status.HTTP_200_OK)
async def delete_practice(
    practice_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PracticeService(db)
    await service.delete_practice(practice_id, current_user.id)
    return {"success": True, "message": "Practice session deleted successfully"}
