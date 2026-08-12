from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.achievement import GamificationSummary
from app.services import gamification_service

router = APIRouter()


@router.get("/summary", response_model=GamificationSummary)
def get_gamification(db: DbSession, current: CurrentUser):
    return gamification_service.get_gamification_summary(db, current.user_id)
