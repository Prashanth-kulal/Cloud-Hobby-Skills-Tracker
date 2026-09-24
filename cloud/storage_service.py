from abc import ABC, abstractmethod
from typing import Optional, BinaryIO
import os
import shutil
import uuid
from config import settings


class StorageService(ABC):
    @abstractmethod
    async def upload_file(self, file_obj: BinaryIO, filename: str, content_type: str, folder: str = "general") -> dict:
        """Uploads a file and returns metadata dictionary including url and storage_path"""
        pass

    @abstractmethod
    async def delete_file(self, storage_path: str) -> bool:
        """Deletes file at storage_path"""
        pass

    @abstractmethod
    def get_file_url(self, storage_path: str) -> str:
        """Returns accessible URL for the storage path"""
        pass


class LocalStorageService(StorageService):
    def __init__(self, base_dir: str = "./uploads"):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)

    async def upload_file(self, file_obj: BinaryIO, filename: str, content_type: str, folder: str = "general") -> dict:
        folder_path = os.path.join(self.base_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        ext = os.path.splitext(filename)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        target_path = os.path.join(folder_path, unique_filename)

        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file_obj, buffer)

        # Storage path relative to uploads root
        rel_path = f"{folder}/{unique_filename}".replace("\\", "/")
        file_url = f"/api/files/download/{rel_path}"

        return {
            "file_name": filename,
            "unique_filename": unique_filename,
            "storage_path": rel_path,
            "file_url": file_url,
            "content_type": content_type,
            "file_size": os.path.getsize(target_path)
        }

    async def delete_file(self, storage_path: str) -> bool:
        try:
            full_path = os.path.join(self.base_dir, storage_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
        except Exception:
            return False

    def get_file_url(self, storage_path: str) -> str:
        return f"/api/files/download/{storage_path}"


class FirebaseCloudStorageService(StorageService):
    """
    Cloud Object Storage implementation for Google Cloud Storage / Firebase Storage.
    Uses google-cloud-storage if credentials exist, falls back gracefully if not yet configured.
    """
    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or settings.FIREBASE_STORAGE_BUCKET
        self.client = None
        self.bucket = None
        # In cloud run or with service account, google-cloud-storage initializes automatically
        try:
            from google.cloud import storage
            self.client = storage.Client(project=settings.FIREBASE_PROJECT_ID) if settings.FIREBASE_PROJECT_ID else storage.Client()
            if self.bucket_name:
                self.bucket = self.client.bucket(self.bucket_name)
        except Exception:
            self.client = None

    async def upload_file(self, file_obj: BinaryIO, filename: str, content_type: str, folder: str = "general") -> dict:
        if not self.bucket:
            raise RuntimeError("Cloud Storage bucket is not configured. Falling back to local storage.")
        
        ext = os.path.splitext(filename)[1]
        unique_name = f"{folder}/{uuid.uuid4()}{ext}"
        blob = self.bucket.blob(unique_name)
        file_obj.seek(0)
        blob.upload_from_file(file_obj, content_type=content_type)
        blob.make_public()

        return {
            "file_name": filename,
            "unique_filename": unique_name,
            "storage_path": unique_name,
            "file_url": blob.public_url,
            "content_type": content_type
        }

    async def delete_file(self, storage_path: str) -> bool:
        if not self.bucket:
            return False
        try:
            blob = self.bucket.blob(storage_path)
            blob.delete()
            return True
        except Exception:
            return False

    def get_file_url(self, storage_path: str) -> str:
        if self.bucket:
            return f"https://storage.googleapis.com/{self.bucket_name}/{storage_path}"
        return f"/api/files/download/{storage_path}"


def get_storage_service() -> StorageService:
    if settings.STORAGE_TYPE == "firebase" and settings.FIREBASE_STORAGE_BUCKET:
        try:
            return FirebaseCloudStorageService()
        except Exception:
            return LocalStorageService(settings.LOCAL_UPLOAD_DIR)
    return LocalStorageService(settings.LOCAL_UPLOAD_DIR)
