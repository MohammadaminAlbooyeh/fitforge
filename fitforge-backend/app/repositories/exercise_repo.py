from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import Exercise


def get_exercise(db: Session, exercise_id: int) -> Exercise | None:
    return db.get(Exercise, exercise_id)


def list_exercises(
    db: Session, muscle_group: str | None = None, offset: int = 0, limit: int = 100
) -> list[Exercise]:
    stmt = select(Exercise).order_by(Exercise.name).offset(offset).limit(limit)
    if muscle_group:
        stmt = stmt.where(Exercise.muscle_group == muscle_group)
    return list(db.execute(stmt).scalars())


def create_exercise(db: Session, **fields) -> Exercise:
    exercise = Exercise(**fields)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise