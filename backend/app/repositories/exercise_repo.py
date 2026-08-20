import random

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, EquipmentType, Exercise, MovementRole, MuscleGroup

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


_DIFFICULTY_ORDER = [
    DifficultyLevel.beginner,
    DifficultyLevel.intermediate,
    DifficultyLevel.advanced,
]
_MOVEMENT_ROLE_ORDER = [MovementRole.compound, MovementRole.isolation]


def _tier_key(exercise: Exercise, equipment: list[EquipmentType]) -> tuple[int, int, int]:
    """Lower sorts first. Same three-part preference as before (difficulty,
    then equipment, then compound-over-isolation), just computed in Python
    now so ties within the best tier can be picked randomly instead of by a
    fixed name order - see find_for_plan."""
    equipment_rank = EQUIPMENT_PREFERENCE_RANK.get(exercise.equipment, len(EQUIPMENT_PREFERENCE_RANK))
    return (
        _DIFFICULTY_ORDER.index(exercise.difficulty),
        equipment_rank,
        _MOVEMENT_ROLE_ORDER.index(exercise.movement_role),
    )


def find_for_plan(
    db: Session,
    muscle_group: MuscleGroup,
    equipment: list[EquipmentType],
    max_difficulty: DifficultyLevel,
    exclude_ids: set[int],
    limit: int,
) -> list[Exercise]:
    allowed_difficulties = _DIFFICULTY_ORDER[: _DIFFICULTY_ORDER.index(max_difficulty) + 1]

    stmt = select(Exercise).where(
        Exercise.muscle_group == muscle_group,
        Exercise.equipment.in_(equipment),
        Exercise.difficulty.in_(allowed_difficulties),
    )
    if exclude_ids:
        stmt = stmt.where(Exercise.id.notin_(exclude_ids))

    candidates = list(db.execute(stmt).scalars())
    if not candidates:
        return []

    # Preference (difficulty, then machine/cable over free weights, then
    # compound-over-isolation) narrows candidates down to the single best
    # tier; within that tier the pick is randomized so regenerating a plan
    # (or a Full Body A/B/C-style split repeating the same slot) doesn't
    # always return the exact same exercise for a muscle group.
    best_tier = min(_tier_key(e, equipment) for e in candidates)
    tied = [e for e in candidates if _tier_key(e, equipment) == best_tier]
    random.shuffle(tied)
    return tied[:limit]


def create_exercise(db: Session, **fields) -> Exercise:
    exercise = Exercise(**fields)
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise
