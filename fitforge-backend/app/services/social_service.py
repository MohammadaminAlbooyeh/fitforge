from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.achievement import UserXP
from app.models.social import Challenge, ChallengeParticipant, Follow
from app.models.user import User
from app.models.workout import Workout
from app.models.workout_session import WorkoutSession
from app.schemas.social import ChallengeCreate


def follow_user(db: Session, follower_id: int, following_id: int) -> None:
    if follower_id == following_id:
        raise ConflictError("Cannot follow yourself")
    existing = db.execute(
        select(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
    ).scalars().first()
    if existing:
        raise ConflictError("Already following")
    db.add(Follow(follower_id=follower_id, following_id=following_id))
    db.commit()


def unfollow_user(db: Session, follower_id: int, following_id: int) -> None:
    f = db.execute(
        select(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
    ).scalars().first()
    if not f:
        raise NotFoundError("Not following")
    db.delete(f)
    db.commit()


def get_followers(db: Session, user_id: int) -> list[User]:
    fids = db.execute(
        select(Follow.follower_id).where(Follow.following_id == user_id)
    ).scalars()
    return [db.get(User, fid) for fid in fids]


def get_following(db: Session, user_id: int) -> list[User]:
    fids = db.execute(
        select(Follow.following_id).where(Follow.follower_id == user_id)
    ).scalars()
    return [db.get(User, fid) for fid in fids]


def is_following(db: Session, follower_id: int, following_id: int) -> bool:
    return db.execute(
        select(Follow).where(Follow.follower_id == follower_id, Follow.following_id == following_id)
    ).scalars().first() is not None


def get_user_public_profile(db: Session, viewer_id: int, user_id: int) -> dict:
    user = db.get(User, user_id)
    if not user:
        raise NotFoundError("User not found")
    ux = db.execute(select(UserXP).where(UserXP.user_id == user_id)).scalars().first()
    followers_count = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.following_id == user_id)
    ) or 0
    following_count = db.scalar(
        select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)
    ) or 0
    return {
        "id": user.id,
        "full_name": user.full_name,
        "total_xp": ux.total_xp if ux else 0,
        "level": ux.level if ux else 1,
        "streak_days": ux.streak_days if ux else 0,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following(db, viewer_id, user_id),
    }


def search_users(db: Session, query: str, limit: int = 20) -> list[User]:
    stmt = select(User).where(User.full_name.ilike(f"%{query}%")).limit(limit)
    return list(db.execute(stmt).scalars())


def create_challenge(db: Session, creator_id: int, data: ChallengeCreate) -> Challenge:
    challenge = Challenge(creator_id=creator_id, **data.model_dump())
    db.add(challenge)
    db.flush()
    db.add(ChallengeParticipant(challenge_id=challenge.id, user_id=creator_id))
    db.commit()
    db.refresh(challenge)
    return challenge


def join_challenge(db: Session, user_id: int, challenge_id: int) -> None:
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise NotFoundError("Challenge not found")
    existing = db.execute(
        select(ChallengeParticipant).where(
            ChallengeParticipant.challenge_id == challenge_id,
            ChallengeParticipant.user_id == user_id,
        )
    ).scalars().first()
    if existing:
        raise ConflictError("Already joined")
    db.add(ChallengeParticipant(challenge_id=challenge_id, user_id=user_id))
    db.commit()


def update_challenge_progress(db: Session, user_id: int, workout_date: date) -> None:
    active = db.execute(
        select(Challenge).where(
            Challenge.status == "active",
            Challenge.start_date <= workout_date,
            Challenge.end_date >= workout_date,
        )
    ).scalars()
    for challenge in active:
        participant = db.execute(
            select(ChallengeParticipant).where(
                ChallengeParticipant.challenge_id == challenge.id,
                ChallengeParticipant.user_id == user_id,
            )
        ).scalars().first()
        if participant:
            participant.workouts_completed += 1
            if participant.workouts_completed >= challenge.goal_count:
                challenge.status = "completed"
    db.commit()


def get_my_challenges(db: Session, user_id: int) -> list[Challenge]:
    cp = db.execute(
        select(ChallengeParticipant.challenge_id).where(ChallengeParticipant.user_id == user_id)
    ).scalars()
    return [db.get(Challenge, cid) for cid in cp]


def get_challenge_participants(db: Session, challenge_id: int) -> list[ChallengeParticipant]:
    return list(db.execute(
        select(ChallengeParticipant).where(ChallengeParticipant.challenge_id == challenge_id)
    ).scalars())


def get_challenge_detail(db: Session, challenge_id: int) -> Challenge:
    challenge = db.get(Challenge, challenge_id)
    if not challenge:
        raise NotFoundError("Challenge not found")
    return challenge


def get_leaderboard(db: Session, limit: int = 50) -> list[dict]:
    stmt = (
        select(UserXP, User.full_name)
        .join(User, UserXP.user_id == User.id)
        .order_by(UserXP.total_xp.desc())
        .limit(limit)
    )
    rows = db.execute(stmt).all()
    return [
        {
            "rank": i + 1,
            "user_id": ux.user_id,
            "full_name": name,
            "total_xp": ux.total_xp,
            "level": ux.level,
            "streak_days": ux.streak_days,
        }
        for i, (ux, name) in enumerate(rows)
    ]


def get_activity_feed(db: Session, user_id: int, limit: int = 30) -> list[dict]:
    fids = list(db.execute(
        select(Follow.following_id).where(Follow.follower_id == user_id)
    ).scalars())
    if not fids:
        return []
    sessions = list(db.execute(
        select(WorkoutSession, User.full_name, Workout.name.label("workout_name"))
        .join(User, WorkoutSession.user_id == User.id)
        .outerjoin(Workout, WorkoutSession.workout_id == Workout.id)
        .where(WorkoutSession.user_id.in_(fids))
        .order_by(WorkoutSession.performed_at.desc())
        .limit(limit)
    ).all())
    return [
        {
            "user_id": s.user_id,
            "full_name": full_name,
            "workout_name": workout_name,
            "performed_at": s.performed_at.isoformat(),
            "notes": s.notes,
            "set_count": len(s.sets) if s.sets else 0,
        }
        for s, full_name, workout_name in sessions
    ]
