from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    SessionUser,
    create_access_token,
    hash_password,
    verify_password,
)
from app.repositories import user_repo
from app.schemas.user import UserCreate


def register(db: Session, data: UserCreate) -> dict:
    if user_repo.get_user_by_email(db, data.email):
        raise ConflictError("Email already registered")
    password_hash = hash_password(data.password)
    user = user_repo.create_user(db, data.email, password_hash, data.full_name)
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


def login(db: Session, email: str, password: str) -> dict:
    user = user_repo.get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


def get_profile(db: Session, current: SessionUser):
    return user_repo.get_user_by_id(db, current.user_id)