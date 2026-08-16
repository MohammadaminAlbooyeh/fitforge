from pydantic import BaseModel, Field


class RevenueCatWebhookPayload(BaseModel):
    type: str = Field(min_length=1)
    appUserId: str = Field(min_length=1)
    productId: str | None = None
    expirationAtMs: int | None = None
    purchasedAtMs: int | None = None
