import enum
from datetime import date
from typing import List

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class SplitType(str, enum.Enum):
    full_body = "full_body"
    upper_lower = "upper_lower"
    push_pull_legs = "push_pull_legs"


class PlanStatus(str, enum.Enum):
    active = "active"
    archived = "archived"


class WorkoutPlan(Base):
    """The prescription: what the user is supposed to do.

    Kept strictly separate from WorkoutLog (what actually happened) so real
    progressive-overload history can be computed from logs alone.
    """

    __tablename__ = "workout_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    days_per_week: Mapped[int] = mapped_column(Integer)
    split_type: Mapped[SplitType] = mapped_column(Enum(SplitType))
    start_date: Mapped[date] = mapped_column(Date)
    status: Mapped[PlanStatus] = mapped_column(Enum(PlanStatus), default=PlanStatus.active, index=True)

    user = relationship("User")
    plan_days: Mapped[List["PlanDay"]] = relationship(
        back_populates="workout_plan", cascade="all, delete-orphan", order_by="PlanDay.day_number"
    )


class PlanDay(Base):
    __tablename__ = "plan_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_plan_id: Mapped[int] = mapped_column(ForeignKey("workout_plans.id"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(255))
    weekday: Mapped[int] = mapped_column(Integer, nullable=True)  # 0=Monday .. 6=Sunday

    workout_plan = relationship("WorkoutPlan", back_populates="plan_days")
    plan_day_exercises: Mapped[List["PlanDayExercise"]] = relationship(
        back_populates="plan_day",
        cascade="all, delete-orphan",
        order_by="PlanDayExercise.order_index",
    )


class PlanDayExercise(Base):
    __tablename__ = "plan_day_exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_day_id: Mapped[int] = mapped_column(ForeignKey("plan_days.id"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), index=True)
    sets: Mapped[int] = mapped_column(Integer, default=3)
    reps_range: Mapped[str] = mapped_column(String(20), default="8-12")
    rest_seconds: Mapped[int] = mapped_column(Integer, default=60)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    skipped: Mapped[bool] = mapped_column(Boolean, default=False)
    target_weight_kg: Mapped[float] = mapped_column(Float, nullable=True)

    plan_day = relationship("PlanDay", back_populates="plan_day_exercises")
    exercise = relationship("Exercise")
