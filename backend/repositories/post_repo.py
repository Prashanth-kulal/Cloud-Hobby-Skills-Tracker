from typing import List, Optional, Tuple
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func, delete, or_
from sqlalchemy.ext.asyncio import AsyncSession
from models.post import Post, Comment, Like
from models.user import User
from models.skill import Skill
from repositories.base import BaseRepository


class PostRepository(BaseRepository[Post]):
    def __init__(self, session: AsyncSession):
        super().__init__(Post, session)

    async def get_feed(
        self,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[Post]:
        stmt = (
            select(Post)
            .options(
                selectinload(Post.user),
                selectinload(Post.skill),
                selectinload(Post.likes),
                selectinload(Post.comments)
            )
        )
        if category and category.lower() != "all":
            stmt = stmt.where(Post.category.ilike(category))

        if search:
            search_term = f"%{search}%"
            stmt = stmt.outerjoin(User, Post.user_id == User.id).outerjoin(Skill, Post.skill_id == Skill.id).where(
                or_(
                    Post.content.ilike(search_term),
                    User.username.ilike(search_term),
                    User.full_name.ilike(search_term),
                    Skill.skill_name.ilike(search_term),
                    Post.category.ilike(search_term)
                )
            )

        stmt = stmt.order_by(Post.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_post_details(self, post_id: str) -> Optional[Post]:
        stmt = (
            select(Post)
            .options(
                selectinload(Post.user),
                selectinload(Post.skill),
                selectinload(Post.likes),
                selectinload(Post.comments).selectinload(Comment.user)
            )
            .where(Post.id == post_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    # Likes
    async def get_like(self, user_id: str, post_id: str) -> Optional[Like]:
        stmt = select(Like).where(Like.user_id == user_id, Like.post_id == post_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def add_like(self, user_id: str, post_id: str) -> bool:
        existing = await self.get_like(user_id, post_id)
        if existing:
            return False  # Already liked
        like = Like(user_id=user_id, post_id=post_id)
        self.session.add(like)
        await self.session.commit()
        return True

    async def remove_like(self, user_id: str, post_id: str) -> bool:
        stmt = delete(Like).where(Like.user_id == user_id, Like.post_id == post_id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0

    # Comments
    async def add_comment(self, comment: Comment) -> Comment:
        self.session.add(comment)
        await self.session.commit()
        await self.session.refresh(comment)
        return comment

    async def get_comment_by_id(self, comment_id: str) -> Optional[Comment]:
        stmt = select(Comment).options(selectinload(Comment.user)).where(Comment.id == comment_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_comment(self, comment: Comment) -> bool:
        await self.session.delete(comment)
        await self.session.commit()
        return True

    async def get_post_comments(self, post_id: str) -> List[Comment]:
        stmt = (
            select(Comment)
            .options(selectinload(Comment.user))
            .where(Comment.post_id == post_id)
            .order_by(Comment.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
