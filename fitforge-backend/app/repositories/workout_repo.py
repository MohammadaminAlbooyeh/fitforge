from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.workout import Workout


def get_workout(db: Session, workout_id: int, user_id: int) -> Workout | None:
    stmt = (
        select(Workout)
        .where(Workout.id == workout_id, Workout.user_id == user_id)
        .options(selectinload(Workout.exercises))
    )
    return db.execute(stmt).scalar_one_or_none()


def list_workouts(db: Session, user_id: int) -> list[Workout]:
    stmt = (
        select(Workout)
        .where(Workout.user_id == user_id)
        .order_by(Workout.id)
        .options(selectinload(Workout.exercises))
    )
    return list(db.execute(stmt).scalars())


def create_workout(db: Session, workout: Workout) -> Workout:
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout


def update_workout(db: Session, workout: Workout, **fields) -> Workout:
    for key, value in fields.items():
        if value is not None:
            setattr(workout, key, value)
    db.commit()
    db.refresh(workout)
    return workout


def delete_workout(db: Session, workout: Workout) -> None:
    db.delete(workout)
    db.commit()