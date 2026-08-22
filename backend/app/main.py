from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import get_settings
from app.core.exceptions import FitForgeError
from app.core.telemetry import setup_telemetry
from app.database import SessionLocal
from app.seed.users import seed_admin_user

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(FitForgeError)
async def fitforge_exception_handler(_request, exc: FitForgeError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


app.include_router(api_router, prefix=settings.API_V1_PREFIX)

setup_telemetry(app)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


@app.on_event("startup")
def ensure_standing_accounts() -> None:
    db = SessionLocal()
    try:
        seed_admin_user(db)
    except Exception:
        # Tables may not exist yet on a fresh DB before migrations run.
        pass
    finally:
        db.close()