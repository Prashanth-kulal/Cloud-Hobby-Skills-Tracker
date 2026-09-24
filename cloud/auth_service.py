from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class CloudAuthService(ABC):
    """
    Abstract Authentication interface allowing smooth transition between
    Local JWT Authentication and Managed Cloud Identity (Firebase Authentication).
    """

    @abstractmethod
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verifies access token and returns user claims/identity"""
        pass

    @abstractmethod
    async def get_user_by_id(self, uid: str) -> Optional[Dict[str, Any]]:
        """Retrieves user profile from identity provider"""
        pass


class FirebaseAuthService(CloudAuthService):
    """
    Firebase Authentication implementation for Google Cloud hosting.
    Uses firebase-admin SDK if available.
    """
    def __init__(self):
        self.firebase_app = None
        try:
            import firebase_admin
            from firebase_admin import auth
            if not firebase_admin._apps:
                firebase_admin.initialize_app()
            self.auth = auth
        except Exception:
            self.auth = None

    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        if not self.auth:
            return None
        try:
            decoded_token = self.auth.verify_id_token(token)
            return {
                "sub": decoded_token.get("uid"),
                "email": decoded_token.get("email"),
                "name": decoded_token.get("name")
            }
        except Exception:
            return None

    async def get_user_by_id(self, uid: str) -> Optional[Dict[str, Any]]:
        if not self.auth:
            return None
        try:
            user = self.auth.get_user(uid)
            return {
                "id": user.uid,
                "email": user.email,
                "full_name": user.display_name,
                "profile_picture": user.photo_url
            }
        except Exception:
            return None
