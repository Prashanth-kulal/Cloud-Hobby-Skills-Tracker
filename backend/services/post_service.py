from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.post_repo import PostRepository
from repositories.skill_repo import SkillRepository
from models.post import Post, Comment
from schemas import PostCreate, PostUpdate, CommentCreate


class PostService:
    def __init__(self, session: AsyncSession):
        self.repo = PostRepository(session)
        self.skill_repo = SkillRepository(session)

    async def create_post(self, user_id: str, data: PostCreate) -> dict:
        category = data.category or "General"
        if data.skill_id:
            skill = await self.skill_repo.get_by_id(data.skill_id)
            if skill and not data.category:
                category = skill.category or "General"

        post = Post(
            user_id=user_id,
            skill_id=data.skill_id,
            content=data.content.strip(),
            media_url=data.media_url,
            category=category
        )
        created = await self.repo.create(post)
        post_details = await self.repo.get_post_details(created.id)
        return self._format_post(post_details, current_user_id=user_id)

    async def get_feed(
        self,
        category: Optional[str] = None,
        search: Optional[str] = None,
        current_user_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[dict]:
        posts = await self.repo.get_feed(category=category, search=search, limit=limit, offset=offset)
        return [self._format_post(p, current_user_id) for p in posts]

    async def get_post_details(self, post_id: str, current_user_id: Optional[str] = None) -> dict:
        post = await self.repo.get_post_details(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        data = self._format_post(post, current_user_id)
        data["comments"] = [
            c.to_dict(author=c.user.to_public_dict() if c.user else None)
            for c in post.comments
        ]
        return data

    async def update_post(self, post_id: str, user_id: str, data: PostUpdate) -> dict:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another user's post")

        if data.content is not None:
            post.content = data.content.strip()
        if data.media_url is not None:
            post.media_url = data.media_url
        if data.category is not None:
            post.category = data.category

        await self.repo.update(post)
        refreshed = await self.repo.get_post_details(post_id)
        return self._format_post(refreshed, current_user_id=user_id)

    async def delete_post(self, post_id: str, user_id: str) -> bool:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's post")
        return await self.repo.delete(post)

    # Likes
    async def like_post(self, post_id: str, user_id: str) -> dict:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        success = await self.repo.add_like(user_id, post_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already liked this post")

        refreshed = await self.repo.get_post_details(post_id)
        return self._format_post(refreshed, current_user_id=user_id)

    async def unlike_post(self, post_id: str, user_id: str) -> dict:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        await self.repo.remove_like(user_id, post_id)
        refreshed = await self.repo.get_post_details(post_id)
        return self._format_post(refreshed, current_user_id=user_id)

    # Comments
    async def add_comment(self, post_id: str, user_id: str, data: CommentCreate) -> dict:
        post = await self.repo.get_by_id(post_id)
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        comment = Comment(
            user_id=user_id,
            post_id=post_id,
            content=data.content.strip()
        )
        created = await self.repo.add_comment(comment)
        # Fetch with user
        full_comment = await self.repo.get_comment_by_id(created.id)
        return full_comment.to_dict(author=full_comment.user.to_public_dict() if full_comment.user else None)

    async def delete_comment(self, comment_id: str, user_id: str) -> bool:
        comment = await self.repo.get_comment_by_id(comment_id)
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        if comment.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's comment")
        return await self.repo.delete_comment(comment)

    def _format_post(self, post: Post, current_user_id: Optional[str] = None) -> dict:
        like_count = len(post.likes) if post.likes is not None else 0
        comment_count = len(post.comments) if post.comments is not None else 0
        user_liked = False
        if current_user_id and post.likes:
            user_liked = any(like.user_id == current_user_id for like in post.likes)

        author = post.user.to_public_dict() if post.user else {
            "id": post.user_id,
            "username": "unknown",
            "full_name": "Community Member"
        }

        return post.to_dict(
            author=author,
            skill=post.skill,
            like_count=like_count,
            comment_count=comment_count,
            user_liked=user_liked
        )
