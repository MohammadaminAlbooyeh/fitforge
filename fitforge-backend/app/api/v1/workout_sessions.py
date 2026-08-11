from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.workout_session import WorkoutSessionCreate, WorkoutSessionRead
from app.services import gamification_service, workout_session_service

router = APIRouter()


@router.post(
    "/{workout_id}/sessions",
    response_model=WorkoutSessionRead,
    status_code=status.HTTP_201_CREATED,
)
def create_session(workout_id: int, payload: WorkoutSessionCreate, db: DbSession, current: CurrentUser):
    session = workout_session_service.log_session(db, current.user_id, workout_id, payload)
    gamification_service.record_workout_xp(db, current.user_id, session.performed_at.date())
    return session


@router.get(
    "/{workout_id}/sessions",
    response_model=list[WorkoutSessionRead],
)
def list_sessions(workout_id: int, db: DbSession, current: CurrentUser):
    return workout_session_service.get_sessions(db, current.user_id, workout_id)
