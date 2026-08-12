from fastapi import APIRouter, Depends

from app.dependencies import CurrentUser
from app.schemas.entitlements import EntitlementsResponse
from app.services.entitlement_client import get_entitlements

router = APIRouter()


@router.get("/me", response_model=EntitlementsResponse)
def get_my_entitlements(current: CurrentUser):
    entitlements = get_entitlements(current.user_id)
    return EntitlementsResponse(
        userId=entitlements.user_id,
        plan=entitlements.plan.upper(),
        status=entitlements.status,
        storeProductId=entitlements.store_product_id,
        currentPeriodEnd=entitlements.current_period_end,
    )
