from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.workout_log import WorkoutLog


def list_for_user(db: Session, user_id: int, limit: int = 50) -> list[WorkoutLog]:
    stmt = (
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user_id)
        .order_by(WorkoutLog.completed_at.desc(), WorkoutLog.id.desc())
        .limit(limit)
        .options(selectinload(WorkoutLog.log_sets))
    )
    return list(db.execute(stmt).scalars())


def create(db: Session, workout_log: WorkoutLog) -> WorkoutLog:
    db.add(workout_log)
    db.commit()
    db.refresh(workout_log)
    return workout_log
