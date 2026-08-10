from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.workout_session import WorkoutSession


def create_workout_session(db: Session, session: WorkoutSession) -> WorkoutSession:
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_workout_sessions(db: Session, workout_id: int, user_id: int) -> list[WorkoutSession]:
    stmt = (
        select(WorkoutSession)
        .where(WorkoutSession.workout_id == workout_id, WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.performed_at.desc())
    )
    return list(db.execute(stmt).scalars())
