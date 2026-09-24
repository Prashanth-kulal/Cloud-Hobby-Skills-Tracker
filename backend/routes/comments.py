from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import CommentCreate, CommentResponse
from utils.auth import get_current_user
from models.user import User
from services.post_service import PostService

router = APIRouter(tags=["Comments"])


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    post_id: str,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    return await service.add_comment(post_id, current_user.id, comment_in)


@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: str,
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    post = await service.repo.get_post_details(post_id)
    if not post:
        return []
    return [
        c.to_dict(author=c.user.to_public_dict() if c.user else None)
        for c in post.comments
    ]


@router.delete("/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = PostService(db)
    await service.delete_comment(comment_id, current_user.id)
    return {"success": True, "message": "Comment deleted successfully"}
