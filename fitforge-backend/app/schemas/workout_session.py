from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class WorkoutSessionSetCreate(BaseModel):
    exercise_id: int
    weight_kg: float | None = None
    reps: int | None = None


class WorkoutSessionCreate(BaseModel):
    performed_at: datetime | None = None
    notes: str | None = None
    sets: list[WorkoutSessionSetCreate] = Field(default_factory=list)


class WorkoutSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workout_id: int
    performed_at: datetime
    notes: str | None = None
    sets: list[dict[str, Any]]
