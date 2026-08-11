from datetime import date

from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.workout_log import PersonalRecordRead, WorkoutLogCreate, WorkoutLogRead
from app.services import gamification_service, social_service, workout_log_service

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
