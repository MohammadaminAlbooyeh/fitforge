from fastapi import APIRouter

from app.core.deps_entitlement import RequiresPro
from app.dependencies import CurrentUser, DbSession
from app.schemas.analytics import AnalyticsSummary
from app.services.analytics_service import analytics_summary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: DbSession, current: CurrentUser, _: RequiresPro):
    return analytics_summary(db, current.user_id)