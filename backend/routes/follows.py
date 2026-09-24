from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import UserPublicResponse
from utils.auth import get_current_user
from models.user import User
from repositories.follow_repo import FollowRepository
from repositories.user_repo import UserRepository

router = APIRouter(prefix="/users", tags=["Follows"])


@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")

    user_repo = UserRepository(db)
    target_user = await user_repo.get_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    repo = FollowRepository(db)
    success = await repo.follow(current_user.id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already following this user")

    return {"success": True, "message": f"You are now following {target_user.username}"}


@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = FollowRepository(db)
    success = await repo.unfollow(current_user.id, user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not following this user")

    return {"success": True, "message": "Unfollowed successfully"}


@router.get("/{user_id}/followers", response_model=List[UserPublicResponse])
async def get_followers(user_id: str, db: AsyncSession = Depends(get_db)):
    repo = FollowRepository(db)
    followers = await repo.get_followers(user_id)
    return [u.to_public_dict() for u in followers]


@router.get("/{user_id}/following", response_model=List[UserPublicResponse])
async def get_following(user_id: str, db: AsyncSession = Depends(get_db)):
    repo = FollowRepository(db)
    following = await repo.get_following(user_id)
    return [u.to_public_dict() for u in following]
