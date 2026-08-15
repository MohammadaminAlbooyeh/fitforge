from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.body_measurement import BodyMeasurement
from app.models.nutrition import NutritionLog
from app.models.user import User
from app.models.water import WaterLog
from app.models.workout import Workout, WorkoutExercise
from app.models.workout_log import WorkoutLog
from app.models.workout_plan import WorkoutPlan
from app.models.workout_session import WorkoutSession


def _user_payload(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "gender": user.gender.value if user.gender else None,
        "birth_date": user.birth_date.isoformat() if user.birth_date else None,
        "height_cm": user.height_cm,
        "weight_kg": user.weight_kg,
        "goal": user.goal.value if user.goal else None,
        "experience_level": user.experience_level.value if user.experience_level else None,
        "available_days_per_week": user.available_days_per_week,
        "available_equipment": user.available_equipment,
    }


def _session_sets_serializable(sets) -> list[dict]:
    return [dict(s) for s in (sets or [])]


def export_user_data(db: Session, user_id: int) -> dict:
    user = db.execute(select(User).where(User.id == user_id)).scalars().first()
    if not user:
        return {"error": "user not found"}

    workouts = db.execute(select(Workout).where(Workout.user_id == user_id)).scalars().all()
    sessions = db.execute(
        select(WorkoutSession).where(WorkoutSession.user_id == user_id)
    ).scalars().all()
    workout_logs = db.execute(
        select(WorkoutLog).where(WorkoutLog.user_id == user_id).order_by(WorkoutLog.completed_at)
    ).scalars().all()
    nutrition = db.execute(
        select(NutritionLog).where(NutritionLog.user_id == user_id).order_by(NutritionLog.log_date)
    ).scalars().all()
    water = db.execute(
        select(WaterLog).where(WaterLog.user_id == user_id).order_by(WaterLog.log_date)
    ).scalars().all()
    measurements = db.execute(
        select(BodyMeasurement).where(BodyMeasurement.user_id == user_id).order_by(BodyMeasurement.date)
    ).scalars().all()
    plans = db.execute(
        select(WorkoutPlan).where(WorkoutPlan.user_id == user_id).order_by(WorkoutPlan.start_date)
    ).scalars().all()

    workout_payload = []
    for w in workouts:
        workout_payload.append({
            "id": w.id,
            "name": w.name,
            "description": w.description,
            "scheduled_at": w.scheduled_at.isoformat() if w.scheduled_at else None,
            "exercises": [
                {
                    "exercise_id": we.exercise_id,
                    "sets": we.sets,
                    "reps": we.reps,
                    "weight_kg": we.weight_kg,
                }
                for we in w.exercises
            ],
        })

    return {
        "exported_at": date.today().isoformat(),
        "profile": _user_payload(user),
        "workouts": workout_payload,
        "workout_sessions": [
            {
                "id": s.id,
                "workout_id": s.workout_id,
                "performed_at": s.performed_at.isoformat(),
                "notes": s.notes,
                "sets": _session_sets_serializable(s.sets),
            }
            for s in sessions
        ],
        "workout_logs": [
            {
                "id": l.id,
                "completed_at": l.completed_at.isoformat(),
                "status": l.status.value,
                "sets": [
                    {
                        "exercise_id": ls.exercise_id,
                        "weight_kg": ls.weight_kg,
                        "reps": ls.reps,
                        "set_number": ls.set_number,
                        "is_personal_record": ls.is_personal_record,
                    }
                    for ls in l.log_sets
                ],
            }
            for l in workout_logs
        ],
        "nutrition_logs": [
            {
                "id": n.id,
                "log_date": n.log_date.isoformat(),
                "meal": n.meal,
                "food_item": n.food_item,
                "calories": n.calories,
                "protein_g": n.protein_g,
                "carbs_g": n.carbs_g,
                "fat_g": n.fat_g,
            }
            for n in nutrition
        ],
        "water_logs": [
            {
                "id": w.id,
                "log_date": w.log_date.isoformat(),
                "amount_ml": w.amount_ml,
            }
            for w in water
        ],
        "body_measurements": [
            {
                "id": m.id,
                "date": m.date.isoformat(),
                "weight_kg": m.weight_kg,
                "body_fat_pct": m.body_fat_pct,
                "chest_cm": m.chest_cm,
                "waist_cm": m.waist_cm,
                "hips_cm": m.hips_cm,
                "arms_cm": m.arms_cm,
                "thighs_cm": m.thighs_cm,
            }
            for m in measurements
        ],
        "workout_plans": [
            {
                "id": p.id,
                "days_per_week": p.days_per_week,
                "split_type": p.split_type.value,
                "start_date": p.start_date.isoformat(),
                "status": p.status.value,
                "days": [
                    {
                        "day_number": d.day_number,
                        "title": d.title,
                        "weekday": d.weekday,
                        "exercises": [
                            {
                                "exercise_id": pe.exercise_id,
                                "sets": pe.sets,
                                "reps_range": pe.reps_range,
                                "rest_seconds": pe.rest_seconds,
                                "order_index": pe.order_index,
                                "skipped": pe.skipped,
                                "target_weight_kg": pe.target_weight_kg,
                            }
                            for pe in d.plan_day_exercises
                        ],
                    }
                    for d in p.plan_days
                ],
            }
            for p in plans
        ],
    }
