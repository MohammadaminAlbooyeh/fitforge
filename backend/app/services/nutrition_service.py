from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.nutrition import NutritionGoal, NutritionLog
from app.models.water import WaterLog
from app.schemas.nutrition import (
    NutritionGoalSet,
    NutritionLogCreate,
    NutritionLogUpdate,
    WaterLogCreate,
)


def log_entry(db: Session, user_id: int, data: NutritionLogCreate) -> NutritionLog:
    entry = NutritionLog(user_id=user_id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_entry(db: Session, user_id: int, entry_id: int) -> NutritionLog:
    entry = db.get(NutritionLog, entry_id)
    if entry is None or entry.user_id != user_id:
        raise NotFoundError("Nutrition log not found")
    return entry


def update_entry(
    db: Session, user_id: int, entry_id: int, data: NutritionLogUpdate
) -> NutritionLog:
    entry = get_entry(db, user_id, entry_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(entry, key, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_entry(db: Session, user_id: int, entry_id: int) -> None:
    entry = get_entry(db, user_id, entry_id)
    db.delete(entry)
    db.commit()


def list_for_day(db: Session, user_id: int, day: date) -> list[NutritionLog]:
    stmt = select(NutritionLog).where(
        NutritionLog.user_id == user_id, NutritionLog.log_date == day
    )
    return list(db.execute(stmt).scalars())


def daily_summary(db: Session, user_id: int, day: date) -> dict:
    stmt = (
        select(
            func.coalesce(func.sum(NutritionLog.calories), 0.0),
            func.coalesce(func.sum(NutritionLog.protein_g), 0.0),
            func.coalesce(func.sum(NutritionLog.carbs_g), 0.0),
            func.coalesce(func.sum(NutritionLog.fat_g), 0.0),
        )
        .where(NutritionLog.user_id == user_id, NutritionLog.log_date == day)
    )
    calories, protein, carbs, fat = db.execute(stmt).one()
    summary = {
        "log_date": day,
        "total_calories": calories,
        "total_protein_g": protein,
        "total_carbs_g": carbs,
        "total_fat_g": fat,
    }

    goal = get_goal(db, user_id)
    if goal is not None:
        if goal.daily_calories is not None:
            summary["goal_calories"] = goal.daily_calories
            summary["remaining_calories"] = goal.daily_calories - calories
        if goal.protein_g is not None:
            summary["goal_protein_g"] = goal.protein_g
            summary["remaining_protein_g"] = goal.protein_g - protein
        if goal.carbs_g is not None:
            summary["goal_carbs_g"] = goal.carbs_g
            summary["remaining_carbs_g"] = goal.carbs_g - carbs
        if goal.fat_g is not None:
            summary["goal_fat_g"] = goal.fat_g
            summary["remaining_fat_g"] = goal.fat_g - fat

    return summary


def get_goal(db: Session, user_id: int) -> NutritionGoal | None:
    return db.execute(
        select(NutritionGoal).where(NutritionGoal.user_id == user_id)
    ).scalars().first()


def set_goal(db: Session, user_id: int, data: NutritionGoalSet) -> NutritionGoal:
    goal = get_goal(db, user_id)
    if goal is None:
        goal = NutritionGoal(user_id=user_id)
        db.add(goal)
    for key, value in data.model_dump().items():
        setattr(goal, key, value)
    db.commit()
    db.refresh(goal)
    return goal


def log_water(db: Session, user_id: int, data: WaterLogCreate) -> WaterLog:
    entry = WaterLog(user_id=user_id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def delete_water(db: Session, user_id: int, entry_id: int) -> None:
    entry = db.get(WaterLog, entry_id)
    if entry is None or entry.user_id != user_id:
        raise NotFoundError("Water log not found")
    db.delete(entry)
    db.commit()


def water_summary(db: Session, user_id: int, day: date) -> dict:
    total = db.scalar(
        select(func.coalesce(func.sum(WaterLog.amount_ml), 0.0)).where(
            WaterLog.user_id == user_id, WaterLog.log_date == day
        )
    )
    return {
        "log_date": day,
        "total_ml": round(total, 0),
        "cups": round(total / 250, 1),
    }


def list_water_for_day(db: Session, user_id: int, day: date) -> list[WaterLog]:
    stmt = select(WaterLog).where(
        WaterLog.user_id == user_id, WaterLog.log_date == day
    )
    return list(db.execute(stmt).scalars())