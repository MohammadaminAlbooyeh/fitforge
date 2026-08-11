from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.body_measurement import BodyMeasurement
from app.schemas.body_measurement import BodyMeasurementCreate, BodyMeasurementUpdate


def create_measurement(db: Session, user_id: int, data: BodyMeasurementCreate) -> BodyMeasurement:
    m = BodyMeasurement(user_id=user_id, **data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def get_measurement(db: Session, user_id: int, measurement_id: int) -> BodyMeasurement:
    m = db.get(BodyMeasurement, measurement_id)
    if m is None or m.user_id != user_id:
        raise NotFoundError("Measurement not found")
    return m


def update_measurement(
    db: Session, user_id: int, measurement_id: int, data: BodyMeasurementUpdate
) -> BodyMeasurement:
    m = get_measurement(db, user_id, measurement_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m


def delete_measurement(db: Session, user_id: int, measurement_id: int) -> None:
    m = get_measurement(db, user_id, measurement_id)
    db.delete(m)
    db.commit()


def list_measurements(db: Session, user_id: int, limit: int = 90) -> list[BodyMeasurement]:
    stmt = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == user_id)
        .order_by(BodyMeasurement.date.desc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars())


def get_latest(db: Session, user_id: int) -> BodyMeasurement | None:
    stmt = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == user_id)
        .order_by(BodyMeasurement.date.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()


def get_trend(db: Session, user_id: int, days: int = 90) -> list[BodyMeasurement]:
    from datetime import timedelta

    cutoff = date.today() - timedelta(days=days)
    stmt = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == user_id, BodyMeasurement.date >= cutoff)
        .order_by(BodyMeasurement.date.asc())
    )
    return list(db.execute(stmt).scalars())
