from fastapi import APIRouter, Query, status

from app.dependencies import DbSession
from app.repositories import exercise_repo
from app.schemas.exercise import ExerciseCreate, ExerciseRead

router = APIRouter()


@router.get("/", response_model=list[ExerciseRead])
def list_exercises(
    db: DbSession,
    muscle_group: str | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    return exercise_repo.list_exercises(db, muscle_group, offset, limit)


@router.post("/", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(payload: ExerciseCreate, db: DbSession):
    return exercise_repo.create_exercise(db, **payload.model_dump())