from fastapi import APIRouter

from app.core.deps_entitlement import RequiresPro
from app.core.exceptions import NotFoundError
from app.dependencies import CurrentUser, DbSession
from app.repositories import exercise_repo, user_repo, workout_plan_repo
from app.schemas.workout_plan_db import (
    AdaptiveAdjustResult,
    GeneratePlanRequest,
    PlanDayExerciseRead,
    PlanDayExerciseUpdate,
    WorkoutPlanRead,
)
from app.services import analytics_service
from app.services.plan_generator import adaptive_adjust_plan, generate_plan

router = APIRouter()


@router.post("/generate", response_model=WorkoutPlanRead, status_code=201)
def generate(payload: GeneratePlanRequest, db: DbSession, current: CurrentUser):
    user = user_repo.get_user_by_id(db, current.user_id)
    return generate_plan(db, user, payload.days_per_week)


@router.get("/active", response_model=WorkoutPlanRead)
def get_active(db: DbSession, current: CurrentUser):
    plan = workout_plan_repo.get_active_plan(db, current.user_id)
    if plan is None:
        raise NotFoundError("No active workout plan")
    return plan


@router.patch("/plan-day-exercises/{plan_day_exercise_id}", response_model=PlanDayExerciseRead)
def update_plan_day_exercise(
    plan_day_exercise_id: int, payload: PlanDayExerciseUpdate, db: DbSession, current: CurrentUser
):
    pde = workout_plan_repo.get_plan_day_exercise(db, plan_day_exercise_id, current.user_id)
    if pde is None:
        raise NotFoundError("Plan day exercise not found")

    if payload.exercise_id is not None:
        replacement = exercise_repo.get_exercise(db, payload.exercise_id)
        if replacement is None:
            raise NotFoundError("Replacement exercise not found")
        pde.exercise_id = payload.exercise_id
        pde.skipped = False

    if payload.skipped is not None:
        pde.skipped = payload.skipped

    return workout_plan_repo.save_plan_day_exercise(db, pde)


@router.post("/adaptive-adjust", response_model=AdaptiveAdjustResult)
def adaptive_adjust(db: DbSession, current: CurrentUser, _: RequiresPro):
    """Pro feature: adjust the active plan's un-logged days based on recent
    training load (deload if recovery is trending low)."""
    user = user_repo.get_user_by_id(db, current.user_id)
    weekly_volume = analytics_service.get_weekly_volume(db, current.user_id)
    recovery = analytics_service.get_recovery_insight(weekly_volume)
    return adaptive_adjust_plan(db, user, recovery.recovery_score)
