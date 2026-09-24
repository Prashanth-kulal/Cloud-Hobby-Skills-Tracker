from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import UserRegister, UserLogin, TokenResponse, UserPrivateResponse
from services.auth_service import AuthService
from utils.auth import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    user = await auth_service.register(user_in)
    return {
        "success": True,
        "message": "User registered successfully",
        "data": user.to_private_dict()
    }


@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    auth_service = AuthService(db)
    result = await auth_service.login(login_in)
    return result


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.get("/me", response_model=UserPrivateResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user.to_private_dict()
