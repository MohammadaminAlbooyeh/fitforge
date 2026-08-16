from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.dependencies import DbSession
from app.schemas.webhooks import RevenueCatWebhookPayload
from app.services import subscription_service

router = APIRouter()


@router.post("/revenuecat", status_code=200)
async def revenuecat_webhook(request: Request, db: DbSession):
    settings = get_settings()
    secret = settings.REVENUECAT_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    body = await request.body()
    signature = request.headers.get("X-RevenueCat-Signature")
    if not subscription_service.verify_webhook_signature(secret, body, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = RevenueCatWebhookPayload.model_validate_json(body)
    subscription_service.apply_webhook(db, payload.model_dump())
    return {}
