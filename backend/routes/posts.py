from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import PostCreate, PostUpdate, PostResponse
from utils.auth import get_current_user, get_optional_current_user
from models.user import User
from services.post_service import PostService

router = APIRouter(tags=["Community Posts"])


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_in: PostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    return await service.create_post(current_user.id, post_in)


@router.get("/feed", response_model=List[PostResponse])
async def get_feed(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    current_user_id = current_user.id if current_user else None
    return await service.get_feed(
        category=category,
        search=search,
        current_user_id=current_user_id,
        limit=limit,
        offset=offset
    )


@router.get("/posts/{post_id}")
async def get_post_details(
    post_id: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    current_user_id = current_user.id if current_user else None
    return await service.get_post_details(post_id, current_user_id=current_user_id)


@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_in: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    return await service.update_post(post_id, current_user.id, post_in)


@router.delete("/posts/{post_id}", status_code=status.HTTP_200_OK)
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    await service.delete_post(post_id, current_user.id)
    return {"success": True, "message": "Post deleted successfully"}
