from sqlalchemy.orm import Session

from app.services import subscription_service


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


def _to_entitlements(subscription) -> Entitlements:
    return Entitlements(
        user_id=subscription.user_id,
        plan=subscription.plan.value,
        status=subscription.status.value.upper(),
        store_product_id=subscription.store_product_id,
        current_period_end=(
            subscription.current_period_end.isoformat() if subscription.current_period_end else None
        ),
    )


def get_entitlements(db: Session, user_id: int) -> Entitlements:
    subscription = subscription_service.get_or_create(db, user_id)
    return _to_entitlements(subscription)


def get_entitlement_plan(db: Session, user_id: int) -> str:
    return get_entitlements(db, user_id).plan


def is_pro(db: Session, user_id: int) -> bool:
    return get_entitlements(db, user_id).is_pro


def purchase(db: Session, user_id: int, product_id: str | None = None) -> None:
    subscription_service.purchase(db, user_id, product_id)


def cancel(db: Session, user_id: int) -> None:
    subscription_service.cancel(db, user_id)
