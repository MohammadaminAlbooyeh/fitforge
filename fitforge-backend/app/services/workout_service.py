from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.workout import Workout, WorkoutExercise
from app.repositories import exercise_repo, workout_repo
from app.schemas.workout import WorkoutCreate


def build_workout(db: Session, user_id: int, data: WorkoutCreate) -> Workout:
    workout = Workout(
        user_id=user_id,
        name=data.name,
        description=data.description,
        scheduled_at=data.scheduled_at,
    )
    for item in data.exercises:
        if exercise_repo.get_exercise(db, item.exercise_id) is None:
            raise ConflictError(f"Exercise {item.exercise_id} not found")
        workout.exercises.append(
            WorkoutExercise(
                exercise_id=item.exercise_id,
                sets=item.sets,
                reps=item.reps,
                weight_kg=item.weight_kg,
            )
        )
    return workout_repo.create_workout(db, workout)


def get_my_workout(db: Session, user_id: int, workout_id: int) -> Workout:
    workout = workout_repo.get_workout(db, workout_id, user_id)
    if workout is None:
        raise NotFoundError("Workout not found")
    return workout