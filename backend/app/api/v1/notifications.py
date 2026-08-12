from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.user import UserRead
from app.services.notification_service import send_workout_reminder

router = APIRouter()


@router.post("/test", status_code=202)
def send_test(db: DbSession, current: CurrentUser, workout_name: str):
    send_workout_reminder(current.email, workout_name)
    return {"status": "queued"}