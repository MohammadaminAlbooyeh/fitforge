"""The Hevy 5-Day Bro Split, free and widely used for natural bodybuilding.

Source: hevyapp.com/bro-split-workout-program-guide. Five training days
(Chest, Back, Shoulders & Traps, Legs & Abs, Arms) run Monday-Friday, with
the weekend as rest/recovery.

FastAPI route: ``GET /api/v1/plans/daily``
"""

from datetime import date

from app.schemas.workout_plan import DailyWorkoutPlan, PlanExercise


def _ex(name: str, group: str, sets: int, reps: str, rest: int) -> PlanExercise:
    return PlanExercise(
        name=name,
        muscle_group=group,
        sets=sets,
        reps=reps,
        rest_seconds=rest,
    )


WEEK: list[DailyWorkoutPlan] = [
    DailyWorkoutPlan(
        day=1,
        weekday="Monday",
        title="Chest",
        focus="Chest",
        rest=False,
        duration_minutes=60,
        exercises=[
            _ex("Flat Barbell Bench Press", "Chest", 4, "6-8", 120),
            _ex("Incline Dumbbell Press", "Chest", 4, "8-12", 90),
            _ex("Plyometric Push-Ups", "Chest", 4, "10-20", 60),
            _ex("Low Cable Chest Fly", "Chest", 4, "15-25", 60),
        ],
    ),
    DailyWorkoutPlan(
        day=2,
        weekday="Tuesday",
        title="Back",
        focus="Back",
        rest=False,
        duration_minutes=60,
        exercises=[
            _ex("Rack Pull Deadlift", "Back", 4, "5-8", 120),
            _ex("Pull-Ups / Chin-Ups", "Back", 4, "5-10", 90),
            _ex("Single-Arm Dumbbell Row", "Back", 4, "8-12", 90),
            _ex("Seated Cable Row", "Back", 4, "12-15", 60),
        ],
    ),
    DailyWorkoutPlan(
        day=3,
        weekday="Wednesday",
        title="Shoulders & Traps",
        focus="Shoulders, Traps",
        rest=False,
        duration_minutes=60,
        exercises=[
            _ex("Overhead Barbell Push-Press", "Shoulders", 4, "6-12", 120),
            _ex("Seated Single-Arm DB Overhead Press", "Shoulders", 4, "8-12", 90),
            _ex("Standing Barbell Shrugs", "Traps", 4, "6-12", 90),
            _ex("Lateral Cable Shoulder Raise", "Shoulders", 4, "12-20", 60),
            _ex("Cable Face Pull", "Rear Delts", 4, "15-25", 60),
        ],
    ),
    DailyWorkoutPlan(
        day=4,
        weekday="Thursday",
        title="Legs & Abs",
        focus="Quads, hamstrings, calves, core",
        rest=False,
        duration_minutes=65,
        exercises=[
            _ex("Barbell High-Bar Back Squat", "Quadriceps", 4, "6-10", 120),
            _ex("Glute-Ham Raise", "Hamstrings", 4, "8-12", 90),
            _ex("Hack Squat", "Quadriceps", 3, "8-15", 90),
            _ex("Lying Hamstring Curl", "Hamstrings", 3, "12-15", 60),
            _ex("Seated Leg Extension", "Quadriceps", 3, "12-20", 60),
            _ex("Machine Calf Raise", "Calves", 4, "10-20", 45),
            _ex("Hanging Knee Raise", "Abs", 4, "10-20", 45),
        ],
    ),
    DailyWorkoutPlan(
        day=5,
        weekday="Friday",
        title="Arms",
        focus="Biceps, triceps, forearms",
        rest=False,
        duration_minutes=55,
        exercises=[
            _ex("EZ-Bar Bicep Curl", "Biceps", 3, "6-10", 90),
            _ex("Close-Grip Bench Press", "Triceps", 3, "6-10", 90),
            _ex("Dumbbell Hammer Curl", "Biceps", 3, "8-12", 60),
            _ex("Rope Cable Tricep Extension", "Triceps", 3, "10-15", 60),
            _ex("Preacher Curl", "Biceps", 3, "12-20", 60),
            _ex("Overhead Tricep Extension", "Triceps", 3, "12-20", 60),
            _ex("Plate Pinches", "Forearms", 3, "30-60 sec hold", 60),
        ],
    ),
    DailyWorkoutPlan(
        day=6,
        weekday="Saturday",
        title="Rest Day",
        focus="Recovery",
        rest=True,
        duration_minutes=20,
        exercises=[
            _ex("Light Walk / Cycle", "Cardio", 1, "20 min", 0),
            _ex("Full Body Stretching", "Mobility", 1, "10 min", 0),
        ],
    ),
    DailyWorkoutPlan(
        day=7,
        weekday="Sunday",
        title="Rest Day",
        focus="Recovery",
        rest=True,
        duration_minutes=20,
        exercises=[
            _ex("Light Walk / Cycle", "Cardio", 1, "20 min", 0),
            _ex("Full Body Stretching", "Mobility", 1, "10 min", 0),
        ],
    ),
]


def get_plan(offset: int = 0) -> DailyWorkoutPlan:
    """Return the plan for today, optionally shifted by ``offset`` days (0-6)."""
    index = (date.today().weekday() + offset) % 7
    return WEEK[index]


def list_week() -> list[DailyWorkoutPlan]:
    return WEEK
