from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.entitlements import EntitlementsResponse, PurchaseRequest
from app.services import entitlement_client

router = APIRouter()


@router.post("/purchase", response_model=EntitlementsResponse)
def purchase_subscription(
    current: CurrentUser, db: DbSession, payload: PurchaseRequest | None = None
):
    entitlement_client.purchase(db, current.user_id, payload.productId if payload else None)
    return _entitlements(db, current)


@router.post("/cancel", response_model=EntitlementsResponse)
def cancel_subscription(current: CurrentUser, db: DbSession):
    entitlement_client.cancel(db, current.user_id)
    return _entitlements(db, current)


def _entitlements(db, current) -> EntitlementsResponse:
    e = entitlement_client.get_entitlements(db, current.user_id)
    return EntitlementsResponse(
        userId=e.user_id,
        plan=e.plan.upper(),
        status=e.status,
        storeProductId=e.store_product_id,
        currentPeriodEnd=e.current_period_end,
    )
