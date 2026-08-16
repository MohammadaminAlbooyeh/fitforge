from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.workout_log import LogStatus
from app.schemas.exercise import ExerciseRead


class LogSetCreate(BaseModel):
    exercise_id: int
    weight_kg: Optional[float] = None
    reps: int = Field(ge=0)
    set_number: int = Field(ge=1)


class LogSetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise_id: int
    weight_kg: Optional[float] = None
    reps: int
    set_number: int
    is_personal_record: bool = False


class WorkoutLogCreate(BaseModel):
    plan_day_id: Optional[int] = None
    completed_at: Optional[date] = None
    status: LogStatus = LogStatus.completed
    sets: list[LogSetCreate] = Field(default_factory=list)
    # Client-generated id (e.g. a UUID) for offline-queued logs; resubmitting
    # the same client_id after reconnecting returns the existing log instead
    # of creating a duplicate.
    client_id: Optional[str] = Field(default=None, max_length=64)


class WorkoutLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    plan_day_id: Optional[int] = None
    completed_at: date
    status: LogStatus
    client_id: Optional[str] = None
    log_sets: list[LogSetRead]


class NextSetSuggestion(BaseModel):
    exercise_id: int
    sets: int
    reps_range: str
    rest_seconds: int
    target_weight_kg: Optional[float] = None
    reasoning: str


class PersonalRecordRead(BaseModel):
    id: int
    exercise: ExerciseRead
    weight_kg: Optional[float] = None
    reps: int
    set_number: int
    completed_at: date
