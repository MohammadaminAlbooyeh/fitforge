from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.workout_plan import PlanStatus, SplitType
from app.schemas.exercise import ExerciseRead


class GeneratePlanRequest(BaseModel):
    days_per_week: int = Field(ge=1, le=5)


class PlanDayExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise: ExerciseRead
    sets: int
    reps_range: str
    rest_seconds: int
    order_index: int


class PlanDayRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day_number: int
    title: str
    weekday: Optional[int] = None
    plan_day_exercises: list[PlanDayExerciseRead]


class WorkoutPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    days_per_week: int
    split_type: SplitType
    start_date: date
    status: PlanStatus
    plan_days: list[PlanDayRead]
