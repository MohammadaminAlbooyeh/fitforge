from fastapi import APIRouter, Query

from app.dependencies import CurrentUser, DbSession
from app.schemas.social import (
    ChallengeCreate,
    ChallengeRead,
    ChallengeParticipantRead,
    FollowCreate,
    LeaderboardEntry,
    UserPublicProfile,
)
from app.services import social_service

router = APIRouter()


@router.post("/follow")
def follow(payload: FollowCreate, db: DbSession, current: CurrentUser):
    social_service.follow_user(db, current.user_id, payload.user_id)
    return {"ok": True}


@router.delete("/follow/{user_id}")
def unfollow(user_id: int, db: DbSession, current: CurrentUser):
    social_service.unfollow_user(db, current.user_id, user_id)
    return {"ok": True}


@router.get("/followers", response_model=list[UserPublicProfile])
def get_followers(db: DbSession, current: CurrentUser):
    users = social_service.get_followers(db, current.user_id)
    return [social_service.get_user_public_profile(db, current.user_id, u.id) for u in users]


@router.get("/following", response_model=list[UserPublicProfile])
def get_following(db: DbSession, current: CurrentUser):
    users = social_service.get_following(db, current.user_id)
    return [social_service.get_user_public_profile(db, current.user_id, u.id) for u in users]


@router.get("/search", response_model=list[UserPublicProfile])
def search_users(db: DbSession, current: CurrentUser, q: str = Query(..., min_length=1)):
    users = social_service.search_users(db, q)
    return [social_service.get_user_public_profile(db, current.user_id, u.id) for u in users]


@router.get("/profile/{user_id}", response_model=UserPublicProfile)
def get_profile(user_id: int, db: DbSession, current: CurrentUser):
    return social_service.get_user_public_profile(db, current.user_id, user_id)


@router.post("/challenges", response_model=ChallengeRead, status_code=201)
def create_challenge(payload: ChallengeCreate, db: DbSession, current: CurrentUser):
    return social_service.create_challenge(db, current.user_id, payload)


@router.post("/challenges/{challenge_id}/join")
def join_challenge(challenge_id: int, db: DbSession, current: CurrentUser):
    social_service.join_challenge(db, current.user_id, challenge_id)
    return {"ok": True}


@router.get("/challenges", response_model=list[ChallengeRead])
def list_my_challenges(db: DbSession, current: CurrentUser):
    challenges = social_service.get_my_challenges(db, current.user_id)
    result = []
    for c in challenges:
        participants = social_service.get_challenge_participants(db, c.id)
        me = [p for p in participants if p.user_id == current.user_id]
        result.append(ChallengeRead(
            id=c.id,
            title=c.title,
            description=c.description,
            challenge_type=c.challenge_type,
            start_date=c.start_date.isoformat(),
            end_date=c.end_date.isoformat(),
            goal_count=c.goal_count,
            created_by=c.created_by,
            created_at=c.created_at.isoformat() if c.created_at else "",
            participants=[
                ChallengeParticipantRead(user_id=p.user_id, full_name="", workouts_completed=p.workouts_completed)
                for p in participants
            ],
            my_workouts_completed=me[0].workouts_completed if me else 0,
        ))
    return result


@router.get("/challenges/{challenge_id}", response_model=ChallengeRead)
def get_challenge(challenge_id: int, db: DbSession, current: CurrentUser):
    return social_service.get_challenge_detail(db, challenge_id)


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def get_leaderboard(db: DbSession, current: CurrentUser, limit: int = 50):
    return social_service.get_leaderboard(db, limit)
