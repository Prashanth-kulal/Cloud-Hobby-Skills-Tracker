from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Hobby & Skills Tracker API",
        "version": "1.0.0"
    }
