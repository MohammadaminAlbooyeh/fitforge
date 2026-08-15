from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    weight_kg: Mapped[float] = mapped_column(Float, nullable=True)
    body_fat_pct: Mapped[float] = mapped_column(Float, nullable=True)
    chest_cm: Mapped[float] = mapped_column(Float, nullable=True)
    waist_cm: Mapped[float] = mapped_column(Float, nullable=True)
    hips_cm: Mapped[float] = mapped_column(Float, nullable=True)
    arms_cm: Mapped[float] = mapped_column(Float, nullable=True)
    thighs_cm: Mapped[float] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
