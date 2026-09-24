from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Standard API Response wrapper
class ApiResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[dict] = None


# User & Auth Schemas
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None


class UserLogin(BaseModel):
    username_or_email: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = None
    profile_picture: Optional[str] = None


class UserPublicResponse(BaseModel):
    id: str
    username: str
    full_name: str
    bio: Optional[str] = None
    interests: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: Optional[str] = None


class UserPrivateResponse(UserPublicResponse):
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPrivateResponse


# Skill Schemas
class SkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = "General"
    current_level: str = "BEGINNER"  # BEGINNER, INTERMEDIATE, ADVANCED
    target_level: str = "INTERMEDIATE"
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    description: Optional[str] = None


class SkillUpdate(BaseModel):
    skill_name: Optional[str] = None
    category: Optional[str] = None
    current_level: Optional[str] = None
    target_level: Optional[str] = None
    target_date: Optional[str] = None
    status: Optional[str] = None  # ACTIVE, PAUSED, COMPLETED
    description: Optional[str] = None


class SkillResponse(BaseModel):
    id: str
    user_id: str
    skill_name: str
    category: Optional[str] = None
    current_level: str
    target_level: str
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    status: str
    description: Optional[str] = None
    total_practice_minutes: int = 0
    total_practice_hours: float = 0.0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# Goal & Milestone Schemas
class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    target_value: float = Field(..., gt=0)


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    achieved: Optional[bool] = None


class MilestoneResponse(BaseModel):
    id: str
    goal_id: str
    title: str
    target_value: float
    achieved: bool
    achieved_at: Optional[str] = None
    created_at: Optional[str] = None


class GoalCreate(BaseModel):
    skill_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=200)
    target_value: float = Field(..., gt=0)
    current_value: float = 0.0
    unit: str = "hours"
    deadline: Optional[str] = None
    milestones: Optional[List[MilestoneCreate]] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    unit: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None


class GoalResponse(BaseModel):
    id: str
    user_id: str
    skill_id: Optional[str] = None
    title: str
    target_value: float
    current_value: float
    unit: str
    deadline: Optional[str] = None
    status: str
    progress_percent: float
    milestones: List[MilestoneResponse] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# Practice Session Schemas
class PracticeCreate(BaseModel):
    skill_id: str
    duration_minutes: int = Field(..., gt=0, le=1440)
    activity: Optional[str] = "Practice session"
    notes: Optional[str] = None
    practiced_at: Optional[str] = None


class PracticeResponse(BaseModel):
    id: str
    user_id: str
    skill_id: str
    skill_name: Optional[str] = None
    duration_minutes: int
    activity: Optional[str] = None
    notes: Optional[str] = None
    practiced_at: Optional[str] = None
    created_at: Optional[str] = None


# Community Post, Comment, Like Schemas
class PostCreate(BaseModel):
    skill_id: Optional[str] = None
    content: str = Field(..., min_length=1, max_length=2000)
    media_url: Optional[str] = None
    category: Optional[str] = "General"


class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    category: Optional[str] = None


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    id: str
    user_id: str
    post_id: str
    content: str
    author: dict
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    user_id: str
    skill_id: Optional[str] = None
    content: str
    media_url: Optional[str] = None
    category: Optional[str] = None
    author: dict
    skill_name: Optional[str] = None
    like_count: int = 0
    comment_count: int = 0
    user_liked: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# File Schemas
class FileUploadResponse(BaseModel):
    id: str
    file_name: str
    file_type: str
    file_url: str
    file_category: Optional[str] = None
    created_at: Optional[str] = None
