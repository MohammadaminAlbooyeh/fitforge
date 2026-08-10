from pydantic import BaseModel


class EntitlementsResponse(BaseModel):
    userId: int
    plan: str
    status: str | None = None
    storeProductId: str | None = None
    currentPeriodEnd: str | None = None
