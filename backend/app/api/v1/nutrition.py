from datetime import date

from fastapi import APIRouter, HTTPException, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.nutrition import (
    DailyNutritionSummary,
    NutritionLogCreate,
    NutritionLogRead,
    NutritionLogUpdate,
)
from app.services import nutrition_service

router = APIRouter()


@router.post("/", response_model=NutritionLogRead, status_code=status.HTTP_201_CREATED)
def create_entry(payload: NutritionLogCreate, db: DbSession, current: CurrentUser):
    return nutrition_service.log_entry(db, current.user_id, payload)


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