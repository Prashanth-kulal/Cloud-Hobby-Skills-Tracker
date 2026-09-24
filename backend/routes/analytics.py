from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from utils.auth import get_current_user
from models.user import User
from services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AnalyticsService(db)
    return await service.get_dashboard_data(current_user.id)


@router.get("/practice")
async def get_practice_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AnalyticsService(db)
    data = await service.get_full_analytics(current_user.id)
    return {
        "summary": data["summary"],
        "weekly_trend": data["charts"]["weekly_trend"],
        "monthly_trend": data["charts"]["monthly_trend"]
    }


@router.get("/skills")
async def get_skills_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = AnalyticsService(db)
    data = await service.get_full_analytics(current_user.id)
    return {
        "hours_by_skill": data["charts"]["hours_by_skill"],
        "goal_stats": data["charts"]["goal_stats"],
        "skill_distribution": data["charts"]["skill_distribution"]
    }
