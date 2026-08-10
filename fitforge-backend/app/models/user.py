from sqlalchemy import Date, Enum, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
import enum


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


class FitnessGoal(str, enum.Enum):
    lose_weight = "lose_weight"
    gain_muscle = "gain_muscle"
    maintain = "maintain"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    gender: Mapped[Gender] = mapped_column(Enum(Gender), nullable=True)
    birth_date: Mapped[Date] = mapped_column(Date, nullable=True)
    height_cm: Mapped[float] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=True)
    goal: Mapped[FitnessGoal] = mapped_column(Enum(FitnessGoal), nullable=True)

    workouts = relationship("Workout", back_populates="user")
    nutrition_logs = relationship("NutritionLog", back_populates="user")