from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import GoalCreate, GoalUpdate, GoalResponse, MilestoneCreate, MilestoneResponse
from utils.auth import get_current_user
from models.user import User
from services.goal_service import GoalService

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.create_goal(current_user.id, goal_in)


@router.get("", response_model=List[GoalResponse])
async def get_goals(
    skill_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.get_user_goals(current_user.id, skill_id=skill_id)


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.get_goal_details(goal_id, current_user.id)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    goal_in: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.update_goal(goal_id, current_user.id, goal_in)


@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    await service.delete_goal(goal_id, current_user.id)
    return {"success": True, "message": "Goal deleted successfully"}


@router.post("/{goal_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def add_milestone_to_goal(
    goal_id: str,
    milestone_in: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.add_milestone(goal_id, current_user.id, milestone_in)
