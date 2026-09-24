from typing import List, Optional
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from repositories.file_repo import FileRepository
from models.file_model import FileRecord
from cloud.storage_service import get_storage_service
from config import settings
import os


class FileService:
    def __init__(self, session: AsyncSession):
        self.repo = FileRepository(session)
        self.storage = get_storage_service()

    async def upload_file(self, user_id: str, file: UploadFile, category: str = "general") -> dict:
        # Validate size and mime type
        if file.content_type not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file.content_type}'. Allowed types: images (JPEG, PNG, GIF, WebP) and PDF."
            )

        # Read contents to check file size
        contents = await file.read()
        max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(contents) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_MB}MB."
            )

        # Upload using storage abstraction
        import io
        file_obj = io.BytesIO(contents)
        subfolder = f"users/{user_id}/{category}"

        try:
            upload_res = await self.storage.upload_file(
                file_obj=file_obj,
                filename=file.filename or "upload.bin",
                content_type=file.content_type,
                folder=subfolder
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Storage upload failed. Please try again."
            )

        # Save metadata record in DB
        file_record = FileRecord(
            user_id=user_id,
            file_name=upload_res.get("file_name", file.filename),
            file_type=file.content_type,
            storage_path=upload_res.get("storage_path"),
            file_url=upload_res.get("file_url"),
            file_category=category
        )
        created = await self.repo.create(file_record)
        return created.to_dict()

    async def get_user_files(self, user_id: str) -> List[dict]:
        files = await self.repo.get_user_files(user_id)
        return [f.to_dict() for f in files]

    async def delete_file(self, file_id: str, user_id: str) -> bool:
        record = await self.repo.get_user_file_by_id(file_id, user_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found or unauthorized")

        # Delete physical file from storage abstraction
        await self.storage.delete_file(record.storage_path)
        # Delete DB metadata
        return await self.repo.delete(record)
