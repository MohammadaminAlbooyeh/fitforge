from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_workouts: int
    total_sessions: int
    total_sets: int
    most_recent_workout: str | None = None