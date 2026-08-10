import httpx
from datetime import datetime, timezone

from app.config import get_settings


class Entitlements:
    def __init__(
        self,
        user_id: int,
        plan: str,
        status: str | None = None,
        store_product_id: str | None = None,
        current_period_end: str | None = None,
    ):
        self.user_id = user_id
        self.plan = plan.lower() if plan else "free"
        self.status = status
        self.store_product_id = store_product_id
        self.current_period_end = current_period_end

    @property
    def is_pro(self) -> bool:
        return self.plan == "pro"


def _normalize_period_end(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc).isoformat()
    return str(value)


def get_entitlements(user_id: int) -> Entitlements:
    settings = get_settings()
    try:
        response = httpx.get(
            f"{settings.SUBSCRIPTION_SERVICE_URL}/entitlements/{user_id}",
            timeout=settings.ENTITLEMENTS_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, ValueError):
        return Entitlements(user_id=user_id, plan="free", status="ACTIVE")

    return Entitlements(
        user_id=data.get("userId", user_id),
        plan=data.get("plan", "free"),
        status=data.get("status"),
        store_product_id=data.get("storeProductId"),
        current_period_end=_normalize_period_end(data.get("currentPeriodEnd")),
    )


def get_entitlement_plan(user_id: int) -> str:
    return get_entitlements(user_id).plan


def is_pro(user_id: int) -> bool:
    return get_entitlements(user_id).is_pro