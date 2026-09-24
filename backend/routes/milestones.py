from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import MilestoneUpdate, MilestoneResponse
from utils.auth import get_current_user
from models.user import User
from services.goal_service import GoalService

router = APIRouter(prefix="/milestones", tags=["Milestones"])


@router.put("/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    milestone_id: str,
    data: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    return await service.update_milestone(milestone_id, current_user.id, data)


@router.delete("/{milestone_id}", status_code=status.HTTP_200_OK)
async def delete_milestone(
    milestone_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService(db)
    await service.delete_milestone(milestone_id, current_user.id)
    return {"success": True, "message": "Milestone deleted successfully"}
