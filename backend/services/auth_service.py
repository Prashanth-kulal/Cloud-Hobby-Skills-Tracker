from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.user_repo import UserRepository
from models.user import User
from schemas import UserRegister, UserLogin
from utils.auth import get_password_hash, verify_password, create_access_token


class AuthService:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def register(self, user_in: UserRegister) -> User:
        # Check duplicate username
        existing_user = await self.user_repo.get_by_username(user_in.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already taken"
            )

        # Check duplicate email
        existing_email = await self.user_repo.get_by_email(user_in.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # Hash password and create user
        hashed_pw = get_password_hash(user_in.password)
        new_user = User(
            username=user_in.username.strip().lower(),
            email=user_in.email.strip().lower(),
            full_name=user_in.full_name.strip(),
            password_hash=hashed_pw
        )
        return await self.user_repo.create(new_user)

    async def login(self, login_in: UserLogin) -> dict:
        user = await self.user_repo.get_by_username_or_email(login_in.username_or_email.strip())
        if not user or not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )

        # Generate JWT
        token = create_access_token({"sub": user.id, "username": user.username})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user.to_private_dict()
        }
