from fastapi import APIRouter

from app.dependencies import DbSession
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserRead
from app.services import auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserCreate, db: DbSession):
    return auth_service.register(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession):
    return auth_service.login(db, payload.email, payload.password)