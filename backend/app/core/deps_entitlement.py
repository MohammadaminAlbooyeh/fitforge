from typing import Annotated

from fastapi import Depends

from app.core.exceptions import PaymentRequiredError
from app.dependencies import CurrentUser
from app.services.entitlement_client import get_entitlements


def requires_pro(user: CurrentUser) -> None:
    """FastAPI dependency that blocks a route unless the user has an active Pro plan.

    The entitlement is resolved through the subscriptions service, either from a local
    cache or via an HTTP call to the Java service.
    """
    entitlements = get_entitlements(user.user_id)
    if not entitlements.is_pro:
        raise PaymentRequiredError("A Pro subscription is required for this feature")


RequiresPro = Annotated[None, Depends(requires_pro)]