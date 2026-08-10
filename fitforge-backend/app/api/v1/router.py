from fastapi import APIRouter

from app.api.v1 import auth, exercises, notifications, nutrition, users, workouts

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])