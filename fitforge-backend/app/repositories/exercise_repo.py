from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, EquipmentType, Exercise, MuscleGroup


def get_exercise(db: Session, exercise_id: int) -> Exercise | None:
    return db.get(Exercise, exercise_id)


def list_exercises(
    db: Session, muscle_group: str | None = None, offset: int = 0, limit: int = 100
) -> list[Exercise]:
    stmt = select(Exercise).order_by(Exercise.name).offset(offset).limit(limit)
    if muscle_group:
        stmt = stmt.where(Exercise.muscle_group == muscle_group)
    return list(db.execute(stmt).scalars())


def find_for_plan(
    db: Session,
    muscle_group: MuscleGroup,
    equipment: list[EquipmentType],
    max_difficulty: DifficultyLevel,
    exclude_ids: set[int],
    limit: int,
) -> list[Exercise]:
    difficulty_order = [
        DifficultyLevel.beginner,
        DifficultyLevel.intermediate,
        DifficultyLevel.advanced,
    ]
    allowed_difficulties = difficulty_order[: difficulty_order.index(max_difficulty) + 1]

    stmt = (
        select(Exercise)
        .where(
            Exercise.muscle_group == muscle_group,
            Exercise.equipment.in_(equipment),
            Exercise.difficulty.in_(allowed_difficulties),
        )
        # "compound" sorts before "isolation" alphabetically, so this
        # naturally prefers compound movements first within a difficulty tier.
        .order_by(Exercise.difficulty, Exercise.movement_role, Exercise.name)
    )
    if exclude_ids:
        stmt = stmt.where(Exercise.id.notin_(exclude_ids))

    results = list(db.execute(stmt).scalars())
    return results[:limit]


def create_exercise(db: Session, **fields) -> Exercise:
    exercise = Exercise(**fields)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
