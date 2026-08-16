import hashlib
import hmac
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.subscription import Plan, Subscription, SubscriptionStatus

TYPE_INITIAL_PURCHASE = "INITIAL_PURCHASE"
TYPE_RENEWAL = "RENEWAL"
TYPE_CANCELLATION = "CANCELLATION"
TYPE_EXPIRATION = "EXPIRATION"
TYPE_UNCANCELLATION = "UNCANCELLATION"


def get_or_create(db: Session, user_id: int) -> Subscription:
    subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    if subscription is not None:
        return subscription
    subscription = Subscription(user_id=user_id, plan=Plan.free, status=SubscriptionStatus.active)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def is_pro(db: Session, user_id: int) -> bool:
    subscription = get_or_create(db, user_id)
    return subscription.plan == Plan.pro and subscription.status == SubscriptionStatus.active


def purchase(db: Session, user_id: int, product_id: str | None = None) -> Subscription:
    subscription = get_or_create(db, user_id)
    now = datetime.now(timezone.utc)
    subscription.plan = Plan.pro
    subscription.status = SubscriptionStatus.active
    subscription.store_product_id = product_id
    subscription.current_period_end = now + timedelta(days=30)
    db.commit()
    db.refresh(subscription)
    return subscription


def cancel(db: Session, user_id: int) -> Subscription:
    subscription = get_or_create(db, user_id)
    subscription.status = SubscriptionStatus.cancelled
    db.commit()
    db.refresh(subscription)
    return subscription


def apply_webhook(db: Session, payload: dict) -> Subscription:
    user_id = int(str(payload["appUserId"]).strip())
    subscription = get_or_create(db, user_id)

    event_type = payload.get("type")
    if event_type in (TYPE_INITIAL_PURCHASE, TYPE_RENEWAL, TYPE_UNCANCELLATION):
        subscription.plan = Plan.pro
        subscription.status = SubscriptionStatus.active
        subscription.store_product_id = payload.get("productId")
        expiration_at_ms = payload.get("expirationAtMs")
        if expiration_at_ms is not None:
            subscription.current_period_end = datetime.fromtimestamp(
                expiration_at_ms / 1000, tz=timezone.utc
            )
    elif event_type == TYPE_CANCELLATION:
        subscription.status = SubscriptionStatus.cancelled
    elif event_type == TYPE_EXPIRATION:
        subscription.status = SubscriptionStatus.expired
        subscription.plan = Plan.free
        subscription.current_period_end = None

    db.commit()
    db.refresh(subscription)
    return subscription


def verify_webhook_signature(secret: str, payload: bytes, signature: str | None) -> bool:
    if not signature:
        return False
    if signature.startswith("sha256="):
        signature = signature[len("sha256="):]
    expected = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
