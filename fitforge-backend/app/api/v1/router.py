from fastapi import APIRouter

from app.api.v1 import (
    achievements,
    analytics,
    auth,
    body_measurements,
    entitlements,
    exercises,
    notifications,
    nutrition,
    plans,
    social,
    subscriptions,
    users,
    workouts,
    workout_logs,
    workout_plans,
    workout_sessions,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(workout_sessions.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(entitlements.router, prefix="/entitlements", tags=["entitlements"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(plans.router, prefix="/plans", tags=["plans"])
api_router.include_router(workout_plans.router, prefix="/workout-plans", tags=["workout-plans"])
api_router.include_router(workout_logs.router, prefix="/workout-logs", tags=["workout-logs"])
api_router.include_router(body_measurements.router, prefix="/body-measurements", tags=["body-measurements"])
api_router.include_router(achievements.router, prefix="/gamification", tags=["gamification"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
