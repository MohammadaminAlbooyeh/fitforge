from datetime import date, timedelta

from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.body_measurement import BodyMeasurementCreate, BodyMeasurementRead, BodyMeasurementUpdate
from app.services import body_measurement_service

router = APIRouter()


@router.post("/", response_model=BodyMeasurementRead, status_code=201)
def create_measurement(payload: BodyMeasurementCreate, db: DbSession, current: CurrentUser):
    return body_measurement_service.create_measurement(db, current.user_id, payload)


@router.get("/", response_model=list[BodyMeasurementRead])
def list_measurements(db: DbSession, current: CurrentUser, limit: int = 90):
    return body_measurement_service.list_measurements(db, current.user_id, limit)


@router.get("/latest", response_model=BodyMeasurementRead | None)
def get_latest(db: DbSession, current: CurrentUser):
    return body_measurement_service.get_latest(db, current.user_id)


@router.get("/trend", response_model=list[BodyMeasurementRead])
def get_trend(db: DbSession, current: CurrentUser, days: int = 90):
    return body_measurement_service.get_trend(db, current.user_id, days)


@router.get("/{measurement_id}", response_model=BodyMeasurementRead)
def get_measurement(measurement_id: int, db: DbSession, current: CurrentUser):
    return body_measurement_service.get_measurement(db, current.user_id, measurement_id)


@router.patch("/{measurement_id}", response_model=BodyMeasurementRead)
def update_measurement(measurement_id: int, payload: BodyMeasurementUpdate, db: DbSession, current: CurrentUser):
    return body_measurement_service.update_measurement(db, current.user_id, measurement_id, payload)


@router.delete("/{measurement_id}", status_code=204)
def delete_measurement(measurement_id: int, db: DbSession, current: CurrentUser):
    body_measurement_service.delete_measurement(db, current.user_id, measurement_id)
