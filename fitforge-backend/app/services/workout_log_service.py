from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.workout_log import LogSet, WorkoutLog
from app.repositories import workout_log_repo, workout_plan_repo
from app.schemas.workout_log import WorkoutLogCreate


def create_log(db: Session, user_id: int, data: WorkoutLogCreate) -> WorkoutLog:
    if data.plan_day_id is not None:
        plan_day = workout_plan_repo.get_plan_day(db, data.plan_day_id, user_id)
        if plan_day is None:
            raise NotFoundError("Plan day not found")

    log = WorkoutLog(
        user_id=user_id,
        plan_day_id=data.plan_day_id,
        completed_at=data.completed_at or date.today(),
        status=data.status,
        log_sets=[
            LogSet(
                exercise_id=s.exercise_id,
                weight_kg=s.weight_kg,
                reps=s.reps,
                set_number=s.set_number,
            )
            for s in data.sets
        ],
    )
    return workout_log_repo.create(db, log)


def list_logs(db: Session, user_id: int) -> list[WorkoutLog]:
    return workout_log_repo.list_for_user(db, user_id)
