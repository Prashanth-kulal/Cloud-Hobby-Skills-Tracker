from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List


class DatabaseService(ABC):
    """
    Abstract Database Interface showing the clean separation between
    relational persistence (SQLite/PostgreSQL) and NoSQL Cloud Persistence (Google Cloud Firestore).
    """

    @abstractmethod
    async def create_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def update_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        pass

    @abstractmethod
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        pass

    @abstractmethod
    async def query_documents(self, collection: str, filters: List[tuple], order_by: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        pass


class FirestoreDatabaseService(DatabaseService):
    """
    Google Cloud Firestore Implementation for cloud-hosted environments.
    When running in Cloud Run, Firestore client automatically reads default Google Cloud credentials.
    """
    def __init__(self, project_id: Optional[str] = None):
        self.project_id = project_id
        self.client = None
        try:
            from google.cloud import firestore
            self.client = firestore.AsyncClient(project=project_id) if project_id else firestore.AsyncClient()
        except Exception:
            self.client = None

    async def create_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            raise RuntimeError("Firestore is not initialized")
        doc_ref = self.client.collection(collection).document(doc_id)
        await doc_ref.set(data)
        return data

    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if not self.client:
            raise RuntimeError("Firestore is not initialized")
        doc_ref = self.client.collection(collection).document(doc_id)
        snapshot = await doc_ref.get()
        return snapshot.to_dict() if snapshot.exists else None

    async def update_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if not self.client:
            raise RuntimeError("Firestore is not initialized")
        doc_ref = self.client.collection(collection).document(doc_id)
        await doc_ref.update(data)
        return True

    async def delete_document(self, collection: str, doc_id: str) -> bool:
        if not self.client:
            raise RuntimeError("Firestore is not initialized")
        doc_ref = self.client.collection(collection).document(doc_id)
        await doc_ref.delete()
        return True

    async def query_documents(self, collection: str, filters: List[tuple], order_by: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.client:
            raise RuntimeError("Firestore is not initialized")
        query = self.client.collection(collection)
        for field, op, val in filters:
            query = query.where(field, op, val)
        if order_by:
            query = query.order_by(order_by)
        query = query.limit(limit)
        docs = await query.stream()
        return [doc.to_dict() async for doc in docs]
