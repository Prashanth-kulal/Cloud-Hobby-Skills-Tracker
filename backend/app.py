import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# Add backend and parent directory to sys.path to allow clean imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import settings
from database import init_db
from routes import (
    health, auth, profile, skills, goals,
    milestones, practice, posts, likes,
    comments, follows, files, analytics
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    await init_db()
    # Ensure uploads directory exists
    os.makedirs(settings.LOCAL_UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Online Hobby & Skills Tracker with Community Sharing on Cloud API",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    settings.FRONTEND_URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local development & cloud hosting origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers for consistent JSON responses
@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "status_code": exc.status_code
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    error_msg = errors[0].get("msg") if errors else "Validation error"
    field = ".".join(str(loc) for loc in errors[0].get("loc", [])) if errors else ""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": f"{field}: {error_msg}" if field else error_msg,
            "errors": errors
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # Log internal error without exposing sensitive details to the client
    import logging
    logging.getLogger("uvicorn.error").error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An internal server error occurred. Please try again later."
        },
    )


# Include API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(milestones.router, prefix="/api")
app.include_router(practice.router, prefix="/api")
app.include_router(posts.router, prefix="/api")
app.include_router(likes.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(follows.router, prefix="/api")
app.include_router(files.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    # Use dynamic PORT environment variable for Google Cloud Run compatibility
    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
