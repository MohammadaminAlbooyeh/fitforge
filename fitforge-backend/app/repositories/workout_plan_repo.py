from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.models.workout_plan import PlanDay, PlanDayExercise, PlanStatus, WorkoutPlan


def get_plan_day_exercise(db: Session, plan_day_exercise_id: int, user_id: int) -> PlanDayExercise | None:
    stmt = (
        select(PlanDayExercise)
        .join(PlanDay, PlanDayExercise.plan_day_id == PlanDay.id)
        .join(WorkoutPlan, PlanDay.workout_plan_id == WorkoutPlan.id)
        .where(PlanDayExercise.id == plan_day_exercise_id, WorkoutPlan.user_id == user_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def archive_active_plans(db: Session, user_id: int) -> None:
    db.execute(
        update(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id, WorkoutPlan.status == PlanStatus.active)
        .values(status=PlanStatus.archived)
    )


def get_active_plan(db: Session, user_id: int) -> WorkoutPlan | None:
    stmt = (
        select(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id, WorkoutPlan.status == PlanStatus.active)
        .options(
            selectinload(WorkoutPlan.plan_days).selectinload(PlanDay.plan_day_exercises).selectinload(
                PlanDayExercise.exercise
            )
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def get_plan_day(db: Session, plan_day_id: int, user_id: int) -> PlanDay | None:
    stmt = (
        select(PlanDay)
        .join(WorkoutPlan, PlanDay.workout_plan_id == WorkoutPlan.id)
        .where(PlanDay.id == plan_day_id, WorkoutPlan.user_id == user_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def save_plan_day_exercise(db: Session, plan_day_exercise: PlanDayExercise) -> PlanDayExercise:
    db.commit()
    db.refresh(plan_day_exercise)
    return plan_day_exercise
