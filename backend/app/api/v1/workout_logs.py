from datetime import date

from fastapi import APIRouter, status

from app.core.exceptions import NotFoundError
from app.dependencies import CurrentUser, DbSession
from app.repositories import exercise_repo
from app.schemas.workout_log import (
    NextSetSuggestion,
    PersonalRecordRead,
    WorkoutLogCreate,
    WorkoutLogRead,
)
from app.services import gamification_service, plan_generator, social_service, workout_log_service

router = APIRouter()


@router.post("/", response_model=WorkoutLogRead, status_code=status.HTTP_201_CREATED)
def create_log(payload: WorkoutLogCreate, db: DbSession, current: CurrentUser):
    log = workout_log_service.create_log(db, current.user_id, payload)
    today = date.today()
    gamification_service.record_workout_xp(db, current.user_id, today)
    social_service.update_challenge_progress(db, current.user_id, today)
    return log


@router.get("/", response_model=list[WorkoutLogRead])
def list_logs(db: DbSession, current: CurrentUser):
    return workout_log_service.list_logs(db, current.user_id)


@router.get("/personal-records", response_model=list[PersonalRecordRead])
def list_personal_records(db: DbSession, current: CurrentUser):
    return workout_log_service.list_personal_records(db, current.user_id)


@router.get("/next-set-suggestion/{exercise_id}", response_model=NextSetSuggestion)
def next_set_suggestion(exercise_id: int, db: DbSession, current: CurrentUser):
    """Rest-timer prompt: what to lift next set, based on the user's most
    recent logged set for this exercise (same progressive-overload logic
    used when generating a plan)."""
    exercise = exercise_repo.get_exercise(db, exercise_id)
    if exercise is None:
        raise NotFoundError("Exercise not found")
    return plan_generator.suggest_next_set(db, current.user_id, exercise)
