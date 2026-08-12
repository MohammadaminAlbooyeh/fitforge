from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.exercise import DifficultyLevel, EquipmentType, MovementRole, MuscleGroup


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: MuscleGroup
    secondary_muscle_groups: Optional[list[MuscleGroup]] = None
    equipment: EquipmentType = EquipmentType.bodyweight
    difficulty: DifficultyLevel = DifficultyLevel.beginner
    movement_role: MovementRole = MovementRole.isolation
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    instructions: Optional[str] = None
    alternative_exercise_id: Optional[int] = None


class ExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    muscle_group: MuscleGroup
    secondary_muscle_groups: Optional[list[MuscleGroup]] = None
    equipment: EquipmentType
    difficulty: DifficultyLevel
    movement_role: MovementRole
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    instructions: Optional[str] = None
    alternative_exercise_id: Optional[int] = None
