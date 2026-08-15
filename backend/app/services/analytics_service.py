from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.achievement import UserXP
from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout_session import WorkoutSession
from app.models.workout_log import WorkoutLog, LogSet
from app.models.body_measurement import BodyMeasurement
from app.schemas.analytics import (
    AnalyticsSummary,
    BodyTrend,
    EnhancedAnalytics,
    ExerciseProgression,
    MonthlyVolume,
    RecoveryInsight,
    StrengthStandard,
    WeeklyVolume,
)


def epley_1rm(weight_kg: float | None, reps: int | None) -> float | None:
    """Epley formula: estimated one-rep max."""
    if not weight_kg or not reps or weight_kg <= 0 or reps <= 0:
        return None
    if reps == 1:
        return weight_kg
    return round(weight_kg * (1 + reps / 30), 1)


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


def get_monthly_volume(db: Session, user_id: int, months: int = 6) -> list[MonthlyVolume]:
    cutoff = date.today() - timedelta(days=months * 30)
    logs = list(db.execute(
        select(WorkoutLog).where(
            WorkoutLog.user_id == user_id,
            WorkoutLog.completed_at >= cutoff,
        ).order_by(WorkoutLog.completed_at.asc())
    ).scalars())

    monthly: dict[str, dict] = {}
    for log in logs:
        key = log.completed_at.strftime("%Y-%m")
        if key not in monthly:
            monthly[key] = {"workouts": 0, "total_sets": 0, "total_volume_kg": 0.0}
        monthly[key]["workouts"] += 1
        for ls in (log.log_sets or []):
            monthly[key]["total_sets"] += 1
            if ls.weight_kg and ls.reps:
                monthly[key]["total_volume_kg"] += ls.weight_kg * ls.reps

    return [
        MonthlyVolume(
            month=key,
            workouts=d["workouts"],
            total_sets=d["total_sets"],
            total_volume_kg=round(d["total_volume_kg"], 1),
        )
        for key, d in sorted(monthly.items())
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

    exercise_ids = [row.exercise_id for row in rows]
    exercises = (
        {e.id: e for e in db.execute(select(Exercise).where(Exercise.id.in_(exercise_ids))).scalars()}
        if exercise_ids
        else {}
    )

    # Prior-period best weights (before the last 30 days) to measure progress.
    cutoff_30d = date.today() - timedelta(days=30)
    prior_best: dict[int, tuple[float, int]] = {}
    if exercise_ids:
        prior_rows = db.execute(
            select(LogSet.exercise_id, func.max(LogSet.weight_kg), func.max(LogSet.reps))
            .join(WorkoutLog, WorkoutLog.id == LogSet.workout_log_id)
            .where(
                WorkoutLog.user_id == user_id,
                LogSet.exercise_id.in_(exercise_ids),
                WorkoutLog.completed_at < cutoff_30d,
            )
            .group_by(LogSet.exercise_id)
        ).all()
        for exercise_id, w, r in prior_rows:
            prior_best[exercise_id] = (w, r)

    result = []
    for row in rows:
        exercise = exercises.get(row.exercise_id)
        if not exercise:
            continue
        est_1rm = epley_1rm(row.best_weight, row.best_reps)
        prev = prior_best.get(row.exercise_id)
        prev_1rm = epley_1rm(prev[0], prev[1]) if prev else None
        result.append(ExerciseProgression(
            exercise_id=row.exercise_id,
            exercise_name=exercise.name,
            best_weight=row.best_weight,
            best_reps=row.best_reps,
            estimated_1rm=est_1rm,
            previous_1rm=prev_1rm,
            total_sets=row.total_sets,
            sessions=row.sessions,
        ))
    return result


def get_strength_standards(
    db: Session, user_id: int, user: User, progression: list[ExerciseProgression]
) -> list[StrengthStandard]:
    """Bodyweight-relative strength ratio per exercise, labelled vs common standards."""
    bodyweight = user.weight_kg
    exercise_ids = [p.exercise_id for p in progression]
    muscle_map = {}
    if exercise_ids:
        muscle_map = {
            e.id: e.muscle_group.value if hasattr(e.muscle_group, "value") else str(e.muscle_group)
            for e in db.execute(select(Exercise).where(Exercise.id.in_(exercise_ids))).scalars()
        }
    standards: list[StrengthStandard] = []
    for p in progression:
        ratio = None
        level = None
        if bodyweight and bodyweight > 0 and p.estimated_1rm:
            ratio = round(p.estimated_1rm / bodyweight, 2)
            # Rough, muscle-group-agnostic labels keyed off experience level.
            if p.estimated_1rm / bodyweight >= 1.0:
                level = "advanced"
            elif p.estimated_1rm / bodyweight >= 0.6:
                level = "intermediate"
            elif p.estimated_1rm / bodyweight >= 0.3:
                level = "beginner"
            else:
                level = "untrained"
        standards.append(StrengthStandard(
            exercise_id=p.exercise_id,
            exercise_name=p.exercise_name,
            muscle_group=muscle_map.get(p.exercise_id, ""),
            bodyweight_ratio=ratio,
            standard_level=level,
            bodyweight_kg=bodyweight,
            estimated_1rm=p.estimated_1rm,
        ))
    return standards


def get_recovery_insight(weekly: list[WeeklyVolume]) -> RecoveryInsight:
    """Recovery score from 0-100 based on volume load trend over the last weeks."""
    recent = [w.total_sets for w in weekly[-4:]]
    baseline = sum(recent[:-1]) / max(1, len(recent) - 1) if len(recent) > 1 else 0
    latest = recent[-1] if recent else 0

    if baseline == 0:
        score = 90
    else:
        ratio = latest / baseline
        # Sustained high or spiking volume lowers the score; a taper raises it.
        if ratio >= 1.4:
            score = 35
        elif ratio >= 1.15:
            score = 55
        elif ratio >= 0.85:
            score = 80
        elif ratio >= 0.5:
            score = 90
        else:
            score = 60

    if score <= 40:
        fatigue = "high"
        suggestion = "Consider a deload week: cut sets ~50% and keep weights the same."
    elif score <= 65:
        fatigue = "moderate"
        suggestion = "Volume has trended high. Take an extra rest day and monitor sleep."
    elif score >= 85:
        fatigue = "low"
        suggestion = "You're recovering well. Keep progressing your top lifts."
    else:
        fatigue = "normal"
        suggestion = None

    return RecoveryInsight(recovery_score=score, fatigue_level=fatigue, suggestion=suggestion)


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
    monthly_volume = get_monthly_volume(db, user_id)
    exercise_progression = get_exercise_progression(db, user_id)
    body_trend = get_body_trend(db, user_id)
    streak_days, longest_streak = get_streak(db, user_id)

    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    strength_standards = get_strength_standards(db, user_id, user, exercise_progression) if user else []
    recovery = get_recovery_insight(weekly_volume)

    return EnhancedAnalytics(
        summary=summary,
        weekly_volume=weekly_volume,
        monthly_volume=monthly_volume,
        strength_standards=strength_standards,
        recovery=recovery,
        exercise_progression=exercise_progression,
        body_trend=body_trend,
        streak_days=streak_days,
        longest_streak=longest_streak,
    )
