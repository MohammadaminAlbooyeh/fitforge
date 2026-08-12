from fastapi import APIRouter, Query

from app.dependencies import CurrentUser
from app.schemas.workout_plan import DailyWorkoutPlan
from app.services import workout_plan_service

router = APIRouter()


@router.get("/daily", response_model=DailyWorkoutPlan)
def get_daily_plan(
    current: CurrentUser,
    offset: int = Query(default=0, ge=0, le=6, description="Shift by days"),
):
    return workout_plan_service.get_plan(offset)


@router.get("/week", response_model=list[DailyWorkoutPlan])
def get_week(current: CurrentUser):
    return workout_plan_service.list_week()