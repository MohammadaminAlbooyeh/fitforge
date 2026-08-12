"""Split algorithm: turns "N days per week" into a concrete WorkoutPlan.

Rule of thumb: more available days = more muscle-group specialization; fewer
days = more full-body coverage per session (so each muscle still gets enough
weekly frequency). Fixed lookup table, no computed logic:

- 1 day  -> Full Body
- 2 days -> Full Body x2 (varied exercise selection across A/B)
- 3 days -> Full Body x3 (most evidence-backed default for beginners)
- 4 days -> Upper / Lower x2 (Upper A, Lower A, Upper B, Lower B)
- 5 days -> Upper / Lower x2.5 (Upper A, Lower A, Upper B, Lower B, Upper C —
  3 upper days + 2 lower days, matching weekly training-day availability
  more heavily toward upper body)

Experience level is intentionally NOT used to pick the split type (v2 concern);
it only affects which difficulty tier of exercise gets selected.

Each day type maps to a fixed list of exercise "slots" (one entry per exercise,
duplicates mean that muscle group gets more than one exercise) matching the
target counts below:

  Full Body (6): quads, hamstrings, chest, back, shoulders, core
  Upper      (5): chest, back, shoulders, biceps, triceps
  Lower      (5): quads, hamstrings, glutes, calves, core

Within a day, slots are filled by querying the exercise library for that
muscle group, filtered by the user's available equipment and capped at their
experience level, preferring compound movements first.

The split itself is still a fixed lookup table, but two things adapt per
user each time a plan is (re)generated:
- Progressive overload: each exercise's ``target_weight_kg`` is derived from
  the user's most recent logged set for it — repeat the same weight until
  they've hit the top of the prescribed rep range, then bump it up.
- Skip avoidance: exercises the user has skipped often in past plans are
  deprioritized (not hard-excluded, so a slot is never left unfilled) in
  favor of other exercises for that muscle group.
"""

from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.models.exercise import DifficultyLevel, EquipmentType, MovementRole, MuscleGroup
from app.models.user import User
from app.models.workout_log import LogSet
from app.models.workout_plan import PlanDay, PlanDayExercise, PlanStatus, SplitType, WorkoutPlan
from app.repositories import exercise_repo, workout_log_repo, workout_plan_repo

# A set is treated as "topped out" (ready to add weight) once its reps reach
# the top of the prescribed rep range for that movement role; otherwise the
# next plan repeats the same weight and asks for more reps first.
WEIGHT_PROGRESSION_FACTOR = 1.025

FULL_BODY_SLOTS = [
    MuscleGroup.quads,
    MuscleGroup.hamstrings,
    MuscleGroup.chest,
    MuscleGroup.back,
    MuscleGroup.shoulders,
    MuscleGroup.core,
]
UPPER_SLOTS = [
    MuscleGroup.chest,
    MuscleGroup.back,
    MuscleGroup.shoulders,
    MuscleGroup.biceps,
    MuscleGroup.triceps,
]
LOWER_SLOTS = [
    MuscleGroup.quads,
    MuscleGroup.hamstrings,
    MuscleGroup.glutes,
    MuscleGroup.calves,
    MuscleGroup.core,
]
# days_per_week -> (split_type, [(day_title, slot_list), ...])
SPLIT_RULES: dict[int, tuple[SplitType, list[tuple[str, list[MuscleGroup]]]]] = {
    1: (SplitType.full_body, [("Full Body", FULL_BODY_SLOTS)]),
    2: (
        SplitType.full_body,
        [("Full Body A", FULL_BODY_SLOTS), ("Full Body B", FULL_BODY_SLOTS)],
    ),
    3: (
        SplitType.full_body,
        [
            ("Full Body A", FULL_BODY_SLOTS),
            ("Full Body B", FULL_BODY_SLOTS),
            ("Full Body C", FULL_BODY_SLOTS),
        ],
    ),
    4: (
        SplitType.upper_lower,
        [
            ("Upper A", UPPER_SLOTS),
            ("Lower A", LOWER_SLOTS),
            ("Upper B", UPPER_SLOTS),
            ("Lower B", LOWER_SLOTS),
        ],
    ),
    5: (
        SplitType.upper_lower,
        [
            ("Upper A", UPPER_SLOTS),
            ("Lower A", LOWER_SLOTS),
            ("Upper B", UPPER_SLOTS),
            ("Lower B", LOWER_SLOTS),
            ("Upper C", UPPER_SLOTS),
        ],
    ),
}

DEFAULT_EQUIPMENT = [EquipmentType.bodyweight]

# Compound lifts get heavier/lower-rep working sets; isolation work stays
# higher rep. Matches the "3x8-12 for most, 2-3x12-15 for core/isolation" guide.
SET_SCHEME = {
    MovementRole.compound: (4, "6-10", 90),
    MovementRole.isolation: (3, "10-15", 60),
}


def get_split_plan(days_per_week: int) -> tuple[SplitType, list[tuple[str, list[MuscleGroup]]]]:
    if days_per_week not in SPLIT_RULES:
        raise ValueError("days_per_week must be between 1 and 5")
    return SPLIT_RULES[days_per_week]


def _resolve_equipment(user: User) -> list[EquipmentType]:
    if not user.available_equipment:
        return list(DEFAULT_EQUIPMENT)
    equipment = {EquipmentType.bodyweight}
    for value in user.available_equipment:
        try:
            equipment.add(EquipmentType(value))
        except ValueError:
            continue
    return list(equipment)


def _resolve_difficulty(user: User) -> DifficultyLevel:
    if user.experience_level:
        return DifficultyLevel(user.experience_level.value)
    return DifficultyLevel.beginner


def _select_exercises_for_day(
    db: Session,
    slots: list[MuscleGroup],
    equipment: list[EquipmentType],
    difficulty: DifficultyLevel,
    plan_wide_used_ids: set[int],
    deprioritized_ids: set[int],
):
    """Fill each slot with one exercise, preferring ones not already used
    elsewhere in this plan (so repeated day types like "Full Body A/B/C"
    don't end up identical) and falling back to reuse once a muscle group's
    pool is exhausted.

    Exercises the user has repeatedly skipped (``deprioritized_ids``) are
    tried last, only once every other option in the muscle group is
    exhausted, so a plan naturally rotates away from movements the user
    doesn't do without ever leaving a slot unfilled."""
    chosen = []
    chosen_ids: set[int] = set()

    for muscle_group in slots:
        # Tried in order, each one relaxing the previous constraint: prefer
        # an exercise that's neither used elsewhere in this plan nor
        # deprioritized; only reuse across days (like original Full Body
        # A/B/C behavior) or bring back a deprioritized exercise once every
        # stricter option is exhausted, so a slot is never left unfilled.
        exclude_layers = [
            chosen_ids | plan_wide_used_ids | deprioritized_ids,
            chosen_ids | deprioritized_ids,
            chosen_ids | plan_wide_used_ids,
            chosen_ids,
        ]
        picks = []
        for exclude in exclude_layers:
            picks = exercise_repo.find_for_plan(
                db,
                muscle_group=muscle_group,
                equipment=equipment,
                max_difficulty=difficulty,
                exclude_ids=exclude,
                limit=1,
            )
            if picks:
                break
        if picks:
            chosen.append(picks[0])
            chosen_ids.add(picks[0].id)

    return chosen


def _apply_progression(
    db: Session, user_id: int, exercise
) -> tuple[int, str, int, float | None]:
    """Prescribe sets/reps/rest from the fixed SET_SCHEME, plus an advisory
    target weight derived from the user's most recent logged set for this
    exercise: repeat the same weight if they haven't yet hit the top of the
    rep range, or bump it up once they have (progressive overload)."""
    sets, reps_range, rest_seconds = SET_SCHEME[exercise.movement_role]

    last_set: LogSet | None = workout_log_repo.get_last_set(db, user_id, exercise.id)
    target_weight_kg = None
    if last_set is not None and last_set.weight_kg:
        _, top_reps = (int(n) for n in reps_range.split("-"))
        if last_set.reps >= top_reps:
            target_weight_kg = round(last_set.weight_kg * WEIGHT_PROGRESSION_FACTOR, 1)
        else:
            target_weight_kg = last_set.weight_kg

    return sets, reps_range, rest_seconds, target_weight_kg


def generate_plan(db: Session, user: User, days_per_week: int) -> WorkoutPlan:
    if not 1 <= days_per_week <= 5:
        raise ConflictError("days_per_week must be between 1 and 5")

    split_type, day_specs = get_split_plan(days_per_week)
    equipment = _resolve_equipment(user)
    difficulty = _resolve_difficulty(user)

    workout_plan_repo.archive_active_plans(db, user.id)
    deprioritized_ids = workout_plan_repo.get_frequently_skipped_exercise_ids(db, user.id)

    plan = WorkoutPlan(
        user_id=user.id,
        days_per_week=days_per_week,
        split_type=split_type,
        start_date=date.today(),
        status=PlanStatus.active,
    )
    db.add(plan)
    db.flush()

    plan_wide_used_ids: set[int] = set()

    for day_number, (title, slots) in enumerate(day_specs, start=1):
        plan_day = PlanDay(
            workout_plan_id=plan.id,
            day_number=day_number,
            title=title,
            weekday=(day_number - 1) % 7,
        )
        db.add(plan_day)
        db.flush()

        exercises = _select_exercises_for_day(
            db, slots, equipment, difficulty, plan_wide_used_ids, deprioritized_ids
        )
        plan_wide_used_ids.update(e.id for e in exercises)

        for order_index, exercise in enumerate(exercises):
            sets, reps_range, rest_seconds, target_weight_kg = _apply_progression(
                db, user.id, exercise
            )
            db.add(
                PlanDayExercise(
                    plan_day_id=plan_day.id,
                    exercise_id=exercise.id,
                    sets=sets,
                    reps_range=reps_range,
                    rest_seconds=rest_seconds,
                    order_index=order_index,
                    target_weight_kg=target_weight_kg,
                )
            )

    db.commit()
    db.refresh(plan)
    return plan
