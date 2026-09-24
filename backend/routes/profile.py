from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import UserUpdate, UserPrivateResponse, UserPublicResponse
from utils.auth import get_current_user
from models.user import User
from repositories.user_repo import UserRepository
from repositories.skill_repo import SkillRepository
from repositories.post_repo import PostRepository
from services.file_service import FileService

router = APIRouter(tags=["User Profile"])


@router.get("/profile", response_model=UserPrivateResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user.to_private_dict()


@router.put("/profile", response_model=UserPrivateResponse)
async def update_profile(
    profile_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name.strip()
    if profile_in.bio is not None:
        current_user.bio = profile_in.bio.strip()
    if profile_in.interests is not None:
        current_user.interests = profile_in.interests.strip()
    if profile_in.profile_picture is not None:
        current_user.profile_picture = profile_in.profile_picture

    updated = await user_repo.update(current_user)
    return updated.to_private_dict()


@router.post("/profile/image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    file_service = FileService(db)
    user_repo = UserRepository(db)
    uploaded = await file_service.upload_file(current_user.id, file, category="profile")
    current_user.profile_picture = uploaded["file_url"]
    await user_repo.update(current_user)
    return {
        "success": True,
        "profile_picture": current_user.profile_picture
    }


@router.get("/users/{username}")
async def get_public_profile(username: str, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    skill_repo = SkillRepository(db)
    post_repo = PostRepository(db)

    skills = await skill_repo.get_user_skills(user.id)
    public_skills = [
        {"skill_name": s.skill_name, "category": s.category, "level": s.current_level.value if s.current_level else "BEGINNER"}
        for s in skills
    ]

    posts = await post_repo.get_feed(search=user.username, limit=10)
    user_posts = [
        {
            "id": p.id,
            "content": p.content,
            "media_url": p.media_url,
            "category": p.category,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "likes": len(p.likes) if p.likes else 0
        }
        for p in posts if p.user_id == user.id
    ]

    return {
        "user": user.to_public_dict(),
        "skills": public_skills,
        "posts": user_posts
    }
