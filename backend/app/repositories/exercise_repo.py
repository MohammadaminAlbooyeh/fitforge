from sqlalchemy import case, select
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, EquipmentType, Exercise, MuscleGroup

# Lower rank sorts first. Machines/cable are safer and more space-efficient
# in a typical commercial gym, so plans lean on them before free weights
# when both are available for the same muscle group and difficulty tier.
# Bodyweight is ranked last on purpose: it's always implicitly available
# (see plan_generator._resolve_equipment) as a fallback so a slot is never
# left unfilled, not as a preference - it must never outrank equipment the
# user actually selected, or picking e.g. "kettlebell only" would still
# mostly return bodyweight exercises.
EQUIPMENT_PREFERENCE_RANK = {
    EquipmentType.machine: 0,
    EquipmentType.cable: 1,
    EquipmentType.band: 2,
    EquipmentType.dumbbell: 3,
    EquipmentType.barbell: 4,
    EquipmentType.kettlebell: 5,
    EquipmentType.bodyweight: 6,
}


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

    equipment_rank = case(
        {eq: rank for eq, rank in EQUIPMENT_PREFERENCE_RANK.items() if eq in equipment},
        value=Exercise.equipment,
        else_=len(EQUIPMENT_PREFERENCE_RANK),
    )

    stmt = (
        select(Exercise)
        .where(
            Exercise.muscle_group == muscle_group,
            Exercise.equipment.in_(equipment),
            Exercise.difficulty.in_(allowed_difficulties),
        )
        # "compound" sorts before "isolation" alphabetically, so this
        # naturally prefers compound movements first within a difficulty tier.
        # Equipment preference (machines/cable over free weights) is applied
        # before that, so a machine option for this muscle group wins even
        # if a free-weight option would otherwise be picked first.
        .order_by(Exercise.difficulty, equipment_rank, Exercise.movement_role, Exercise.name)
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
