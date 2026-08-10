from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.exercise import ExerciseRead


class WorkoutExerciseCreate(BaseModel):
    exercise_id: int
    sets: int = 3
    reps: Optional[int] = None
    weight_kg: Optional[float] = None


class WorkoutExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exercise: ExerciseRead
    sets: int
    reps: Optional[int] = None
    weight_kg: Optional[float] = None


class WorkoutCreate(BaseModel):
    name: str
    description: Optional[str] = None
    scheduled_at: Optional[date] = None
    exercises: List[WorkoutExerciseCreate] = []


class WorkoutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[date] = None


class WorkoutRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    scheduled_at: Optional[date] = None
    exercises: List[WorkoutExerciseRead] = []