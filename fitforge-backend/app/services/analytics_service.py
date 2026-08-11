from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.achievement import UserXP
from app.models.exercise import Exercise
from app.models.workout_session import WorkoutSession
from app.models.workout_log import WorkoutLog, LogSet
from app.models.body_measurement import BodyMeasurement
from app.schemas.analytics import (
    AnalyticsSummary,
    BodyTrend,
    EnhancedAnalytics,
    ExerciseProgression,
    WeeklyVolume,
)


def analytics_summary(db: Session, user_id: int) -> AnalyticsSummary:
    from app.models.workout import Workout

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


def get_weekly_volume(db: Session, user_id: int, weeks: int = 12) -> list[WeeklyVolume]:
    cutoff = date.today() - timedelta(weeks=weeks)
    logs = list(db.execute(
        select(WorkoutLog).where(
            WorkoutLog.user_id == user_id,
            WorkoutLog.completed_at >= cutoff,
        ).order_by(WorkoutLog.completed_at.asc())
    ).scalars())

    weekly: dict[date, dict] = {}
    for log in logs:
        week_start = log.completed_at - timedelta(days=log.completed_at.weekday())
        if week_start not in weekly:
            weekly[week_start] = {"workouts": 0, "total_sets": 0, "total_volume_kg": 0.0}
        weekly[week_start]["workouts"] += 1
        for ls in (log.log_sets or []):
            weekly[week_start]["total_sets"] += 1
            if ls.weight_kg and ls.reps:
                weekly[week_start]["total_volume_kg"] += ls.weight_kg * ls.reps

    return [
        WeeklyVolume(
            week_start=ws.isoformat(),
            workouts=d["workouts"],
            total_sets=d["total_sets"],
            total_volume_kg=d["total_volume_kg"],
        )
        for ws, d in sorted(weekly.items())
    ]


def get_exercise_progression(db: Session, user_id: int) -> list[ExerciseProgression]:
    stmt = (
        select(
            LogSet.exercise_id,
            func.max(LogSet.weight_kg).label("best_weight"),
            func.max(LogSet.reps).label("best_reps"),
            func.count(LogSet.id).label("total_sets"),
            func.count(func.distinct(WorkoutLog.id)).label("sessions"),
        )
        .join(WorkoutLog, WorkoutLog.id == LogSet.workout_log_id)
        .where(WorkoutLog.user_id == user_id)
        .group_by(LogSet.exercise_id)
        .order_by(func.count(LogSet.id).desc())
        .limit(20)
    )
    rows = db.execute(stmt).all()

    result = []
    for row in rows:
        exercise = db.get(Exercise, row.exercise_id)
        if exercise:
            result.append(ExerciseProgression(
                exercise_id=row.exercise_id,
                exercise_name=exercise.name,
                best_weight=row.best_weight,
                best_reps=row.best_reps,
                total_sets=row.total_sets,
                sessions=row.sessions,
            ))
    return result


def get_body_trend(db: Session, user_id: int, days: int = 90) -> list[BodyTrend]:
    cutoff = date.today() - timedelta(days=days)
    measurements = list(db.execute(
        select(BodyMeasurement).where(
            BodyMeasurement.user_id == user_id,
            BodyMeasurement.date >= cutoff,
        ).order_by(BodyMeasurement.date.asc())
    ).scalars())

    return [
        BodyTrend(
            date=m.date.isoformat(),
            weight_kg=m.weight_kg,
            body_fat_pct=m.body_fat_pct,
            chest_cm=m.chest_cm,
            waist_cm=m.waist_cm,
            arms_cm=m.arms_cm,
        )
        for m in measurements
    ]


def get_streak(db: Session, user_id: int) -> tuple[int, int]:
    ux = db.execute(
        select(UserXP).where(UserXP.user_id == user_id)
    ).scalars().first()
    if ux:
        return ux.streak_days, ux.longest_streak
    return 0, 0


def enhanced_analytics(db: Session, user_id: int) -> EnhancedAnalytics:
    summary = analytics_summary(db, user_id)
    weekly_volume = get_weekly_volume(db, user_id)
    exercise_progression = get_exercise_progression(db, user_id)
    body_trend = get_body_trend(db, user_id)
    streak_days, longest_streak = get_streak(db, user_id)

    return EnhancedAnalytics(
        summary=summary,
        weekly_volume=weekly_volume,
        exercise_progression=exercise_progression,
        body_trend=body_trend,
        streak_days=streak_days,
        longest_streak=longest_streak,
    )
