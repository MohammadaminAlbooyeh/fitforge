from fastapi import APIRouter, status

from app.dependencies import CurrentUser, DbSession
from app.schemas.workout_log import WorkoutLogCreate, WorkoutLogRead
from app.services import workout_log_service

router = APIRouter()


@router.post("/", response_model=WorkoutLogRead, status_code=status.HTTP_201_CREATED)
def create_log(payload: WorkoutLogCreate, db: DbSession, current: CurrentUser):
    return workout_log_service.create_log(db, current.user_id, payload)


@router.get("/", response_model=list[WorkoutLogRead])
def list_logs(db: DbSession, current: CurrentUser):
    return workout_log_service.list_logs(db, current.user_id)
