from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.workout import Workout
from app.models.workout_session import WorkoutSession
from app.schemas.analytics import AnalyticsSummary


def analytics_summary(db: Session, user_id: int) -> AnalyticsSummary:
    total_workouts = (
        db.scalar(select(func.count()).select_from(Workout).where(Workout.user_id == user_id))
        or 0
    )
    sessions = list(
        db.scalars(
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.performed_at.desc())
        )
    )
    total_sets = sum(len(s.sets or []) for s in sessions)
    most_recent_workout = sessions[0].performed_at.isoformat() if sessions else None
    return AnalyticsSummary(
        total_workouts=total_workouts,
        total_sessions=len(sessions),
        total_sets=total_sets,
        most_recent_workout=most_recent_workout,
    )