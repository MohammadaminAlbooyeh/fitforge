from datetime import date

from fastapi import APIRouter, HTTPException, status

from app.dependencies import CurrentUser, DbSession
from app.core.exceptions import NotFoundError
from app.schemas.nutrition import (
    DailyNutritionSummary,
    DailyWaterSummary,
    NutritionGoalRead,
    NutritionGoalSet,
    NutritionLogCreate,
    NutritionLogRead,
    NutritionLogUpdate,
    WaterLogCreate,
    WaterLogRead,
)
from app.services import nutrition_service

router = APIRouter()


@router.put("/goal", response_model=NutritionGoalRead)
def set_goal(payload: NutritionGoalSet, db: DbSession, current: CurrentUser):
    return nutrition_service.set_goal(db, current.user_id, payload)


@router.get("/goal", response_model=NutritionGoalRead)
def get_goal(db: DbSession, current: CurrentUser):
    goal = nutrition_service.get_goal(db, current.user_id)
    if goal is None:
        raise NotFoundError("No nutrition goal set")
    return goal


@router.post("/", response_model=NutritionLogRead, status_code=status.HTTP_201_CREATED)
def create_entry(payload: NutritionLogCreate, db: DbSession, current: CurrentUser):
    return nutrition_service.log_entry(db, current.user_id, payload)


@router.post("/water", response_model=WaterLogRead, status_code=status.HTTP_201_CREATED)
def create_water(payload: WaterLogCreate, db: DbSession, current: CurrentUser):
    return nutrition_service.log_water(db, current.user_id, payload)


@router.delete("/water/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_water(entry_id: int, db: DbSession, current: CurrentUser):
    nutrition_service.delete_water(db, current.user_id, entry_id)
    raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/water/day", response_model=DailyWaterSummary)
def water_summary_for_day(day: date, db: DbSession, current: CurrentUser):
    return nutrition_service.water_summary(db, current.user_id, day)


@router.get("/water/day/entries", response_model=list[WaterLogRead])
def water_entries_for_day(day: date, db: DbSession, current: CurrentUser):
    return nutrition_service.list_water_for_day(db, current.user_id, day)


@router.get("/day", response_model=DailyNutritionSummary)
def summary_for_day(day: date, db: DbSession, current: CurrentUser):
    return nutrition_service.daily_summary(db, current.user_id, day)


@router.get("/day/entries", response_model=list[NutritionLogRead])
def entries_for_day(day: date, db: DbSession, current: CurrentUser):
    return nutrition_service.list_for_day(db, current.user_id, day)


@router.get("/{entry_id}", response_model=NutritionLogRead)
def get_entry(entry_id: int, db: DbSession, current: CurrentUser):
    return nutrition_service.get_entry(db, current.user_id, entry_id)


@router.patch("/{entry_id}", response_model=NutritionLogRead)
def update_entry(
    entry_id: int, payload: NutritionLogUpdate, db: DbSession, current: CurrentUser
):
    return nutrition_service.update_entry(db, current.user_id, entry_id, payload)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(entry_id: int, db: DbSession, current: CurrentUser):
    nutrition_service.delete_entry(db, current.user_id, entry_id)
    raise HTTPException(status_code=status.HTTP_204_NO_CONTENT)