from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class AchievementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    badge_type: str
    name: str
    description: str
    icon: str
    xp_earned: int
    earned_at: date


class UserXPRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    total_xp: int
    level: int
    streak_days: int
    longest_streak: int
    last_workout_date: Optional[date] = None


class GamificationSummary(BaseModel):
    xp: UserXPRead
    achievements: list[AchievementRead]
    next_level_xp: int
