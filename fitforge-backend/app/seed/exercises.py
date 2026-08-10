"""Static exercise library seed data.

Sourced from `app/seed/data/fitforge_exercise_seed.xlsx` - a curated 74-exercise
spreadsheet (10 muscle groups, 4-11 exercises each):
target_muscle_group, secondary_muscle_group(s), equipment_required, movement_role
(compound/isolation), difficulty, video_url (left empty - fill in later with licensed
demo clips). This is a starting seed, not exhaustive - grow it over time.

``alternative_exercise_id`` isn't in the source data, so it's computed here: each
exercise is auto-paired with another exercise targeting the same muscle group,
preferring one on different equipment (ideally bodyweight, so there's always a
no-equipment substitute) over an exact equipment match.

Run with: ``python -m app.seed`` (idempotent - upserts by name).
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exercise import DifficultyLevel, EquipmentType, Exercise, MovementRole, MuscleGroup

# (name, muscle_group, secondary_muscle_groups, equipment, difficulty, movement_role)
EXERCISES: list[
    tuple[str, MuscleGroup, list[MuscleGroup], EquipmentType, DifficultyLevel, MovementRole]
] = [
    ("Barbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Incline Barbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Dumbbell Bench Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Incline Dumbbell Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Push-Up", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound),
    ("Dumbbell Chest Fly", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Cable Chest Fly", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Chest Dip", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound),
    ("Machine Chest Press", MuscleGroup.chest, [MuscleGroup.triceps, MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound),
    ("Pec Deck Machine", MuscleGroup.chest, [MuscleGroup.shoulders], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),

    ("Pull-Up", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound),
    ("Lat Pulldown", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound),
    ("Chin-Up", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound),
    ("Straight-Arm Pulldown", MuscleGroup.back, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Barbell Bent-Over Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Dumbbell Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Seated Cable Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.compound),
    ("T-Bar Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Machine Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound),
    ("Barbell Deadlift", MuscleGroup.back, [MuscleGroup.hamstrings, MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound),
    ("Face Pull", MuscleGroup.back, [MuscleGroup.shoulders], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    # No exercise above covers a beginner-friendly bodyweight "pull" pattern
    # (Pull-Up/Chin-Up are intermediate) - without these, bodyweight-only
    # beginners get an empty Pull/Back day. Filling that real gap here.
    ("Inverted Row", MuscleGroup.back, [MuscleGroup.biceps], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound),
    ("Superman", MuscleGroup.back, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),

    ("Overhead Barbell Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Seated Dumbbell Shoulder Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Arnold Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Lateral Raise", MuscleGroup.shoulders, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Cable Lateral Raise", MuscleGroup.shoulders, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Front Raise", MuscleGroup.shoulders, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Rear Delt Fly", MuscleGroup.shoulders, [MuscleGroup.back], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Machine Shoulder Press", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound),
    ("Upright Row", MuscleGroup.shoulders, [MuscleGroup.back], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    # No bodyweight shoulder exercise above - without this, bodyweight-only
    # beginners get an empty shoulder slot on Full Body/Upper/Push days.
    ("Pike Push-Up", MuscleGroup.shoulders, [MuscleGroup.triceps], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound),

    ("Barbell Curl", MuscleGroup.biceps, [], EquipmentType.barbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Dumbbell Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Hammer Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Cable Curl", MuscleGroup.biceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Preacher Curl", MuscleGroup.biceps, [], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.isolation),
    ("Concentration Curl", MuscleGroup.biceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),

    ("Triceps Pushdown", MuscleGroup.triceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Skull Crusher", MuscleGroup.triceps, [], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.isolation),
    ("Overhead Triceps Extension", MuscleGroup.triceps, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Close-Grip Bench Press", MuscleGroup.triceps, [MuscleGroup.chest], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Triceps Dip", MuscleGroup.triceps, [MuscleGroup.chest], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.compound),
    ("Cable Overhead Extension", MuscleGroup.triceps, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    # The only bodyweight triceps exercise above (Triceps Dip) is intermediate;
    # this fills the beginner-bodyweight gap.
    ("Bench Dip", MuscleGroup.triceps, [MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),

    ("Barbell Back Squat", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound),
    ("Front Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound),
    ("Leg Press", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.compound),
    ("Walking Lunge", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Bulgarian Split Squat", MuscleGroup.quads, [MuscleGroup.glutes, MuscleGroup.hamstrings], EquipmentType.dumbbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Leg Extension", MuscleGroup.quads, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),
    ("Goblet Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Hack Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.machine, DifficultyLevel.intermediate, MovementRole.compound),
    # No bodyweight quad exercise above - a real gap for bodyweight-only users.
    ("Bodyweight Squat", MuscleGroup.quads, [MuscleGroup.glutes], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.compound),

    ("Romanian Deadlift", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.back], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Dumbbell RDL", MuscleGroup.hamstrings, [MuscleGroup.glutes, MuscleGroup.back], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),
    ("Lying Leg Curl", MuscleGroup.hamstrings, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),
    ("Seated Leg Curl", MuscleGroup.hamstrings, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),
    ("Good Morning", MuscleGroup.hamstrings, [MuscleGroup.back, MuscleGroup.glutes], EquipmentType.barbell, DifficultyLevel.advanced, MovementRole.compound),
    ("Nordic Curl", MuscleGroup.hamstrings, [], EquipmentType.bodyweight, DifficultyLevel.advanced, MovementRole.isolation),

    ("Hip Thrust", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.barbell, DifficultyLevel.intermediate, MovementRole.compound),
    ("Glute Bridge", MuscleGroup.glutes, [MuscleGroup.hamstrings], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Cable Kickback", MuscleGroup.glutes, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Step-Up", MuscleGroup.glutes, [MuscleGroup.quads], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.compound),

    ("Standing Calf Raise", MuscleGroup.calves, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),
    ("Seated Calf Raise", MuscleGroup.calves, [], EquipmentType.machine, DifficultyLevel.beginner, MovementRole.isolation),
    ("Dumbbell Calf Raise", MuscleGroup.calves, [], EquipmentType.dumbbell, DifficultyLevel.beginner, MovementRole.isolation),
    ("Bodyweight Calf Raise", MuscleGroup.calves, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),

    ("Plank", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Hanging Leg Raise", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.intermediate, MovementRole.isolation),
    ("Cable Crunch", MuscleGroup.core, [], EquipmentType.cable, DifficultyLevel.beginner, MovementRole.isolation),
    ("Russian Twist", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Bicycle Crunch", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Ab Wheel Rollout", MuscleGroup.core, [MuscleGroup.shoulders], EquipmentType.bodyweight, DifficultyLevel.advanced, MovementRole.compound),
    ("Side Plank", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Mountain Climber", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Sit-Up", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
    ("Flutter Kick", MuscleGroup.core, [], EquipmentType.bodyweight, DifficultyLevel.beginner, MovementRole.isolation),
]


def get_seed_rows():
    return EXERCISES


def _pick_alternative(name: str, muscle_group: MuscleGroup, equipment: EquipmentType) -> str | None:
    """Pick another exercise in the same muscle group, preferring a different
    (ideally bodyweight) equipment type so there's always a no-equipment substitute."""
    same_group = [r for r in EXERCISES if r[1] == muscle_group and r[0] != name]
    if not same_group:
        return None

    different_equipment = [r for r in same_group if r[3] != equipment]
    bodyweight = [r for r in different_equipment if r[3] == EquipmentType.bodyweight]

    pool = bodyweight or different_equipment or same_group
    return sorted(pool, key=lambda r: r[0])[0][0]


def seed_exercises(db: Session) -> tuple[int, int]:
    """Idempotently upsert the exercise library by name. Returns (created, updated)."""
    existing = {e.name: e for e in db.execute(select(Exercise)).scalars()}
    created = 0
    updated = 0

    for name, muscle_group, secondary_groups, equipment, difficulty, movement_role in EXERCISES:
        secondary_values = [g.value for g in secondary_groups] or None
        row = existing.get(name)
        if row is None:
            row = Exercise(
                name=name,
                muscle_group=muscle_group,
                secondary_muscle_groups=secondary_values,
                equipment=equipment,
                difficulty=difficulty,
                movement_role=movement_role,
            )
            db.add(row)
            existing[name] = row
            created += 1
        else:
            row.muscle_group = muscle_group
            row.secondary_muscle_groups = secondary_values
            row.equipment = equipment
            row.difficulty = difficulty
            row.movement_role = movement_role
            updated += 1

    db.flush()

    for name, muscle_group, _secondary, equipment, _difficulty, _role in EXERCISES:
        alt_name = _pick_alternative(name, muscle_group, equipment)
        if alt_name is not None:
            existing[name].alternative_exercise_id = existing[alt_name].id

    db.commit()
    return created, updated
