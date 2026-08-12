from pydantic import BaseModel


class PlanExercise(BaseModel):
    name: str
    muscle_group: str
    sets: int
    reps: str
    rest_seconds: int


class DailyWorkoutPlan(BaseModel):
    day: int
    weekday: str
    title: str
    focus: str
    rest: bool
    duration_minutes: int
    exercises: list[PlanExercise]