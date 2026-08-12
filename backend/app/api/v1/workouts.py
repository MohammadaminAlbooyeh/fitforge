from fastapi import APIRouter, Response, status

from app.dependencies import CurrentUser, DbSession
from app.repositories import workout_repo
from app.schemas.workout import WorkoutCreate, WorkoutRead, WorkoutUpdate
from app.services import workout_service

router = APIRouter()


@router.get("/", response_model=list[WorkoutRead])
def list_workouts(db: DbSession, current: CurrentUser):
    return workout_repo.list_workouts(db, current.user_id)


@router.post("/", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_workout(payload: WorkoutCreate, db: DbSession, current: CurrentUser):
    return workout_service.build_workout(db, current.user_id, payload)


@router.get("/{workout_id}", response_model=WorkoutRead)
def get_workout(workout_id: int, db: DbSession, current: CurrentUser):
    return workout_service.get_my_workout(db, current.user_id, workout_id)


@router.patch("/{workout_id}", response_model=WorkoutRead)
def update_workout(
    workout_id: int, payload: WorkoutUpdate, db: DbSession, current: CurrentUser
):
    workout = workout_service.get_my_workout(db, current.user_id, workout_id)
    return workout_repo.update_workout(
        db, workout, **payload.model_dump(exclude_unset=True)
    )


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: DbSession, current: CurrentUser):
    workout = workout_service.get_my_workout(db, current.user_id, workout_id)
    workout_repo.delete_workout(db, workout)
    return Response(status_code=status.HTTP_204_NO_CONTENT)