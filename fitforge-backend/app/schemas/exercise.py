from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: str
    instructions: Optional[str] = None


class ExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    muscle_group: str
    instructions: Optional[str] = None