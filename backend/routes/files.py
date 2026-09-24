from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse as FastFileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import FileUploadResponse
from utils.auth import get_current_user
from models.user import User
from services.file_service import FileService
from config import settings
import os

router = APIRouter(prefix="/files", tags=["Files & Storage"])


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    category: Optional[str] = Form("general"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.upload_file(current_user.id, file, category=category)


@router.get("", response_model=List[FileUploadResponse])
async def get_my_files(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    return await service.get_user_files(current_user.id)


@router.delete("/{file_id}", status_code=status.HTTP_200_OK)
async def delete_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = FileService(db)
    await service.delete_file(file_id, current_user.id)
    return {"success": True, "message": "File deleted successfully"}


@router.get("/download/{file_path:path}")
async def download_local_file(file_path: str):
    """
    Safely serves locally uploaded files, preventing directory traversal.
    """
    base_dir = os.path.abspath(settings.LOCAL_UPLOAD_DIR)
    target_path = os.path.abspath(os.path.join(base_dir, file_path))

    # Guard against directory traversal
    if not target_path.startswith(base_dir):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not os.path.exists(target_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    return FastFileResponse(target_path)
