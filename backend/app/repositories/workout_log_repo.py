from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.workout_log import LogSet, WorkoutLog


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


def get_by_client_id(db: Session, user_id: int, client_id: str) -> WorkoutLog | None:
    stmt = (
        select(WorkoutLog)
        .where(WorkoutLog.user_id == user_id, WorkoutLog.client_id == client_id)
        .options(selectinload(WorkoutLog.log_sets))
    )
    return db.execute(stmt).scalars().first()


def list_personal_records(db: Session, user_id: int) -> list[LogSet]:
    stmt = (
        select(LogSet)
        .join(WorkoutLog, LogSet.workout_log_id == WorkoutLog.id)
        .where(WorkoutLog.user_id == user_id, LogSet.is_personal_record.is_(True))
        .order_by(WorkoutLog.completed_at.desc(), LogSet.id.desc())
        .options(selectinload(LogSet.exercise), selectinload(LogSet.workout_log))
    )
    return list(db.execute(stmt).scalars())


def get_last_set(db: Session, user_id: int, exercise_id: int) -> LogSet | None:
    stmt = (
        select(LogSet)
        .join(WorkoutLog, LogSet.workout_log_id == WorkoutLog.id)
        .where(WorkoutLog.user_id == user_id, LogSet.exercise_id == exercise_id)
        .order_by(WorkoutLog.completed_at.desc(), LogSet.id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()


def get_best_weight(db: Session, user_id: int, exercise_id: int) -> float | None:
    stmt = (
        select(func.max(LogSet.weight_kg))
        .join(WorkoutLog, LogSet.workout_log_id == WorkoutLog.id)
        .where(
            WorkoutLog.user_id == user_id,
            LogSet.exercise_id == exercise_id,
            LogSet.weight_kg.is_not(None),
        )
    )
    return db.execute(stmt).scalar_one_or_none()
