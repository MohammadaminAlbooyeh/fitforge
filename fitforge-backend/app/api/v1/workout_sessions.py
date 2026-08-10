from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.workout_session import WorkoutSessionCreate, WorkoutSessionRead
from app.services.workout_session_service import log_session

router = APIRouter()


@router.post(
    "/{workout_id}/sessions",
    response_model=WorkoutSessionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_session(workout_id: int, payload: WorkoutSessionCreate, db: DbSession, current: CurrentUser):
    return log_session(db, current.user_id, workout_id, payload)
