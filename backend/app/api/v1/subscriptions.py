from fastapi import APIRouter

from app.dependencies import CurrentUser
from app.schemas.entitlements import EntitlementsResponse, PurchaseRequest
from app.services import entitlement_client

router = APIRouter()


@router.post("/purchase", response_model=EntitlementsResponse)
def purchase_subscription(
    current: CurrentUser, payload: PurchaseRequest | None = None
):
    entitlement_client.purchase(current.user_id, payload.productId if payload else None)
    return _entitlements(current)


@router.post("/cancel", response_model=EntitlementsResponse)
def cancel_subscription(current: CurrentUser):
    entitlement_client.cancel(current.user_id)
    return _entitlements(current)


def _entitlements(current) -> EntitlementsResponse:
    e = entitlement_client.get_entitlements(current.user_id)
    return EntitlementsResponse(
        userId=e.user_id,
        plan=e.plan.upper(),
        status=e.status,
        storeProductId=e.store_product_id,
        currentPeriodEnd=e.current_period_end,
    )