import enum
from datetime import date
from typing import List

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class LogStatus(str, enum.Enum):
    completed = "completed"
    partial = "partial"


class WorkoutLog(Base):
    """What actually happened in a session, as distinct from the plan's prescription."""

    __tablename__ = "workout_logs"
    __table_args__ = (UniqueConstraint("user_id", "client_id", name="uq_workout_logs_user_client_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    plan_day_id: Mapped[int] = mapped_column(ForeignKey("plan_days.id"), nullable=True, index=True)
    completed_at: Mapped[date] = mapped_column(Date)
    status: Mapped[LogStatus] = mapped_column(Enum(LogStatus), default=LogStatus.completed)
    # Client-generated id (e.g. a UUID) set by the mobile app when a log is
    # created offline, so replaying a queued sync after reconnecting is
    # idempotent instead of creating a duplicate log.
    client_id: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user = relationship("User")
    plan_day = relationship("PlanDay")
    log_sets: Mapped[List["LogSet"]] = relationship(
        back_populates="workout_log", cascade="all, delete-orphan", order_by="LogSet.set_number"
    )


class LogSet(Base):
    __tablename__ = "log_sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    workout_log_id: Mapped[int] = mapped_column(ForeignKey("workout_logs.id"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), index=True)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=True)
    reps: Mapped[int] = mapped_column(Integer)
    set_number: Mapped[int] = mapped_column(Integer)
    is_personal_record: Mapped[bool] = mapped_column(Boolean, default=False)

    workout_log = relationship("WorkoutLog", back_populates="log_sets")
    exercise = relationship("Exercise")
