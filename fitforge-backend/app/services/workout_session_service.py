from sqlalchemy.orm import Session

from app.models.workout_session import WorkoutSession
from app.repositories import workout_repo
from app.repositories.workout_session_repo import create_workout_session
from app.schemas.workout_session import WorkoutSessionCreate


def log_session(db: Session, user_id: int, workout_id: int, data: WorkoutSessionCreate) -> WorkoutSession:
    workout = workout_repo.get_workout(db, workout_id, user_id)
    if workout is None:
        from app.core.exceptions import NotFoundError

        raise NotFoundError("Workout not found")

    session = WorkoutSession(
        user_id=user_id,
        workout_id=workout_id,
        performed_at=data.performed_at,
        notes=data.notes,
        sets=[item.model_dump() for item in data.sets],
    )
    return create_workout_session(db, session)
