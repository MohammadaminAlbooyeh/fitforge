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


class MonthlyVolume(BaseModel):
    month: str
    workouts: int
    total_sets: int
    total_volume_kg: float


class StrengthStandard(BaseModel):
    exercise_id: int
    exercise_name: str
    muscle_group: str
    bodyweight_ratio: float | None = None
    standard_level: str | None = None
    bodyweight_kg: float | None = None
    estimated_1rm: float | None = None


class RecoveryInsight(BaseModel):
    recovery_score: int
    fatigue_level: str
    suggestion: str | None = None


class ExerciseProgression(BaseModel):
    exercise_id: int
    exercise_name: str
    best_weight: float | None = None
    best_reps: int | None = None
    estimated_1rm: float | None = None
    previous_1rm: float | None = None
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
    monthly_volume: list[MonthlyVolume]
    strength_standards: list[StrengthStandard]
    recovery: RecoveryInsight
    exercise_progression: list[ExerciseProgression]
    body_trend: list[BodyTrend]
    streak_days: int
    longest_streak: int
