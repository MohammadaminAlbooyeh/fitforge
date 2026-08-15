from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.core.deps_entitlement import RequiresPro
from app.dependencies import CurrentUser, DbSession
from app.schemas.analytics import AnalyticsSummary, EnhancedAnalytics
from app.services import analytics_service, export_service

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: DbSession, current: CurrentUser, _: RequiresPro):
    return analytics_service.analytics_summary(db, current.user_id)


@router.get("/enhanced", response_model=EnhancedAnalytics)
def get_enhanced_analytics(db: DbSession, current: CurrentUser):
    return analytics_service.enhanced_analytics(db, current.user_id)


@router.get("/export")
def export_data(db: DbSession, current: CurrentUser):
    data = export_service.export_user_data(db, current.user_id)
    return JSONResponse(content=data)
