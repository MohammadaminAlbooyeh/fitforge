from sqlalchemy.orm import Session

from app.models.workout_session import WorkoutSession
from app.repositories import workout_repo
from app.repositories.workout_session_repo import create_workout_session, list_workout_sessions
from app.schemas.workout_session import WorkoutSessionCreate


def log_session(db: Session, user_id: int, workout_id: int, data: WorkoutSessionCreate) -> WorkoutSession:
    workout = _get_workout_or_404(db, workout_id, user_id)

    session = WorkoutSession(
        user_id=user_id,
        workout_id=workout_id,
        performed_at=data.performed_at,
        notes=data.notes,
        sets=[item.model_dump() for item in data.sets],
    )
    return create_workout_session(db, session)


def get_sessions(db: Session, user_id: int, workout_id: int) -> list[WorkoutSession]:
    _get_workout_or_404(db, workout_id, user_id)
    return list_workout_sessions(db, workout_id, user_id)


def _get_workout_or_404(db: Session, workout_id: int, user_id: int):
    workout = workout_repo.get_workout(db, workout_id, user_id)
    if workout is None:
        from app.core.exceptions import NotFoundError

        raise NotFoundError("Workout not found")
    return workout
