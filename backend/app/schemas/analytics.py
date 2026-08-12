from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_workouts: int
    total_sessions: int
    total_sets: int
    most_recent_workout: str | None = None


class WeeklyVolume(BaseModel):
    week_start: str
    workouts: int
    total_sets: int
    total_volume_kg: float


class ExerciseProgression(BaseModel):
    exercise_id: int
    exercise_name: str
    best_weight: float | None = None
    best_reps: int | None = None
    total_sets: int = 0
    sessions: int = 0


class BodyTrend(BaseModel):
    date: str
    weight_kg: float | None = None
    body_fat_pct: float | None = None
    chest_cm: float | None = None
    waist_cm: float | None = None
    arms_cm: float | None = None


class EnhancedAnalytics(BaseModel):
    summary: AnalyticsSummary
    weekly_volume: list[WeeklyVolume]
    exercise_progression: list[ExerciseProgression]
    body_trend: list[BodyTrend]
    streak_days: int
    longest_streak: int
