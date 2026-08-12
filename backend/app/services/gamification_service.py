from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.achievement import Achievement, UserXP
from app.models.workout_session import WorkoutSession


# XP rewards
WORKOUT_XP = 50
STREAK_BONUS_PER_DAY = 5
PR_BONUS = 25

# Badge definitions
BADGES = [
    {"type": "first_workout", "name": "First Step", "description": "Complete your first workout", "icon": "🏃", "xp": 100, "threshold": 1},
    {"type": "workout_5", "name": "Getting Started", "description": "Complete 5 workouts", "icon": "💪", "xp": 200, "threshold": 5},
    {"type": "workout_10", "name": "Dedicated", "description": "Complete 10 workouts", "icon": "🔥", "xp": 300, "threshold": 10},
    {"type": "workout_25", "name": "Iron Will", "description": "Complete 25 workouts", "icon": "⚡", "xp": 500, "threshold": 25},
    {"type": "workout_50", "name": "Half Century", "description": "Complete 50 workouts", "icon": "🏆", "xp": 1000, "threshold": 50},
    {"type": "workout_100", "name": "Centurion", "description": "Complete 100 workouts", "icon": "👑", "xp": 2000, "threshold": 100},
    {"type": "streak_3", "name": "On Fire", "description": "3 day streak", "icon": "🔥", "xp": 150, "threshold": 3},
    {"type": "streak_7", "name": "Week Warrior", "description": "7 day streak", "icon": "⭐", "xp": 300, "threshold": 7},
    {"type": "streak_14", "name": "Unstoppable", "description": "14 day streak", "icon": "💫", "xp": 500, "threshold": 14},
    {"type": "streak_30", "name": "Monthly Master", "description": "30 day streak", "icon": "🏅", "xp": 1000, "threshold": 30},
    {"type": "level_5", "name": "Rising Star", "description": "Reach level 5", "icon": "🌟", "xp": 250, "threshold": 5},
    {"type": "level_10", "name": "Veteran", "description": "Reach level 10", "icon": "🎖️", "xp": 500, "threshold": 10},
    {"type": "level_25", "name": "Elite", "description": "Reach level 25", "icon": "💎", "xp": 1000, "threshold": 25},
    {"type": "level_50", "name": "Legend", "description": "Reach level 50", "icon": "🏅", "xp": 2000, "threshold": 50},
]

# XP per level (total XP needed to reach level N)
def xp_for_level(level: int) -> int:
    return int(100 * (level ** 1.5))


def get_or_create_user_xp(db: Session, user_id: int) -> UserXP:
    stmt = select(UserXP).where(UserXP.user_id == user_id)
    ux = db.execute(stmt).scalars().first()
    if ux is None:
        ux = UserXP(user_id=user_id, total_xp=0, level=1, streak_days=0, longest_streak=0)
        db.add(ux)
        db.commit()
        db.refresh(ux)
    return ux


def record_workout_xp(db: Session, user_id: int, workout_date: date) -> list[Achievement]:
    ux = get_or_create_user_xp(db, user_id)
    new_badges = []

    # Calculate streak
    if ux.last_workout_date:
        diff = (workout_date - ux.last_workout_date).days
        if diff == 1:
            ux.streak_days += 1
        elif diff > 1:
            ux.streak_days = 1
        # diff == 0 means same day, no streak change
    else:
        ux.streak_days = 1

    ux.longest_streak = max(ux.longest_streak, ux.streak_days)
    ux.last_workout_date = workout_date

    # Award XP
    xp = WORKOUT_XP + (ux.streak_days - 1) * STREAK_BONUS_PER_DAY
    ux.total_xp += xp

    # Recalculate level
    new_level = 1
    while xp_for_level(new_level + 1) <= ux.total_xp:
        new_level += 1
    ux.level = new_level

    db.commit()

    # Check for new badges
    total_workouts = db.scalar(
        select(func.count()).select_from(WorkoutSession).where(WorkoutSession.user_id == user_id)
    ) or 0

    existing_badges = {a.badge_type for a in db.execute(
        select(Achievement).where(Achievement.user_id == user_id)
    ).scalars()}

    for badge_def in BADGES:
        if badge_def["type"] in existing_badges:
            continue

        earned = False
        if badge_def["type"].startswith("workout_"):
            earned = total_workouts >= badge_def["threshold"]
        elif badge_def["type"].startswith("streak_"):
            earned = ux.streak_days >= badge_def["threshold"]
        elif badge_def["type"].startswith("level_"):
            earned = ux.level >= badge_def["threshold"]

        if earned:
            achievement = Achievement(
                user_id=user_id,
                badge_type=badge_def["type"],
                name=badge_def["name"],
                description=badge_def["description"],
                icon=badge_def["icon"],
                xp_earned=badge_def["xp"],
                earned_at=workout_date,
            )
            db.add(achievement)
            ux.total_xp += badge_def["xp"]
            new_badges.append(achievement)

    if new_badges:
        db.commit()

    return new_badges


def get_gamification_summary(db: Session, user_id: int) -> dict:
    ux = get_or_create_user_xp(db, user_id)
    achievements = list(db.execute(
        select(Achievement).where(Achievement.user_id == user_id).order_by(Achievement.earned_at.desc())
    ).scalars())
    return {
        "xp": ux,
        "achievements": achievements,
        "next_level_xp": xp_for_level(ux.level + 1),
    }
