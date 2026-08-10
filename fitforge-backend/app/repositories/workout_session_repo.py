from sqlalchemy.orm import Session

from app.models.workout_session import WorkoutSession


def create_workout_session(db: Session, session: WorkoutSession) -> WorkoutSession:
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
