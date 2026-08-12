from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class FollowCreate(BaseModel):
    user_id: int


class UserPublicProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    total_xp: int = 0
    level: int = 1
    streak_days: int = 0
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False


class ChallengeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_workouts: int = 10
    start_date: date
    end_date: date


class ChallengeParticipantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    full_name: str
    workouts_completed: int


class ChallengeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    creator_id: int
    title: str
    description: Optional[str] = None
    target_workouts: int
    start_date: date
    end_date: date
    status: str
    participants: list[ChallengeParticipantRead] = []
    my_workouts_completed: int = 0


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    total_xp: int
    level: int
    streak_days: int
