from fastapi import APIRouter

from app.core.exceptions import NotFoundError
from app.dependencies import CurrentUser, DbSession
from app.repositories import user_repo, workout_plan_repo
from app.schemas.workout_plan_db import GeneratePlanRequest, WorkoutPlanRead
from app.services.plan_generator import generate_plan

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
