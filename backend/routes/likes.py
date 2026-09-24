from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import PostResponse
from utils.auth import get_current_user
from models.user import User
from services.post_service import PostService

router = APIRouter(prefix="/posts", tags=["Likes"])


@router.post("/{post_id}/like", response_model=PostResponse)
async def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    return await service.like_post(post_id, current_user.id)


@router.delete("/{post_id}/like", response_model=PostResponse)
async def unlike_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    return await service.unlike_post(post_id, current_user.id)
