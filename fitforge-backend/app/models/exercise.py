import enum

from sqlalchemy import Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MuscleGroup(str, enum.Enum):
    chest = "chest"
    back = "back"
    shoulders = "shoulders"
    biceps = "biceps"
    triceps = "triceps"
    forearms = "forearms"
    quads = "quads"
    hamstrings = "hamstrings"
    glutes = "glutes"
    calves = "calves"
    core = "core"
    # Coarse legacy values, kept for backward compatibility with manually
    # created exercises; the plan generator's day-target tables use the
    # finer-grained groups above exclusively.
    legs = "legs"
    arms = "arms"


class EquipmentType(str, enum.Enum):
    bodyweight = "bodyweight"
    dumbbell = "dumbbell"
    barbell = "barbell"
    machine = "machine"
    cable = "cable"
    kettlebell = "kettlebell"
    band = "band"


class DifficultyLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class MovementRole(str, enum.Enum):
    compound = "compound"
    isolation = "isolation"


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    muscle_group: Mapped[MuscleGroup] = mapped_column(Enum(MuscleGroup), index=True)
    secondary_muscle_groups: Mapped[list] = mapped_column(JSON, nullable=True)
    equipment: Mapped[EquipmentType] = mapped_column(
        Enum(EquipmentType), default=EquipmentType.bodyweight, index=True
    )
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel), default=DifficultyLevel.beginner, index=True
    )
    movement_role: Mapped[MovementRole] = mapped_column(
        Enum(MovementRole), default=MovementRole.isolation, index=True
    )
    video_url: Mapped[str] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    instructions: Mapped[str] = mapped_column(String, nullable=True)
    alternative_exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id"), nullable=True
    )

    alternative_exercise: Mapped["Exercise"] = relationship(
        "Exercise", remote_side=[id], foreign_keys=[alternative_exercise_id]
    )
