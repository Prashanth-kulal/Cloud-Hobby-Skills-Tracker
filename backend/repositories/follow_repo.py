from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.follow import Follow
from models.user import User


class FollowRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_follow(self, follower_id: str, following_id: str) -> Optional[Follow]:
        stmt = select(Follow).where(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def follow(self, follower_id: str, following_id: str) -> bool:
        if follower_id == following_id:
            return False
        existing = await self.get_follow(follower_id, following_id)
        if existing:
            return False
        f = Follow(follower_id=follower_id, following_id=following_id)
        self.session.add(f)
        await self.session.commit()
        return True

    async def unfollow(self, follower_id: str, following_id: str) -> bool:
        stmt = delete(Follow).where(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    async def get_followers(self, user_id: str) -> List[User]:
        stmt = (
            select(User)
            .join(Follow, Follow.follower_id == User.id)
            .where(Follow.following_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_following(self, user_id: str) -> List[User]:
        stmt = (
            select(User)
            .join(Follow, Follow.following_id == User.id)
            .where(Follow.follower_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
