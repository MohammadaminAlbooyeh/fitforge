from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.user import UserRead, UserUpdate
from app.services import auth_service

router = APIRouter()


@router.get("/me", response_model=UserRead)
def get_me(db: DbSession, current: CurrentUser):
    return auth_service.get_profile(db, current)


@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, db: DbSession, current: CurrentUser):
    from app.repositories import user_repo

    user = auth_service.get_profile(db, current)
    return user_repo.update_user(db, user, **payload.model_dump(exclude_unset=True))