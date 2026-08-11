from datetime import date

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.workout_log import LogSet, WorkoutLog
from app.repositories import workout_log_repo, workout_plan_repo
from app.schemas.workout_log import PersonalRecordRead, WorkoutLogCreate


def create_log(db: Session, user_id: int, data: WorkoutLogCreate) -> WorkoutLog:
    if data.plan_day_id is not None:
        plan_day = workout_plan_repo.get_plan_day(db, data.plan_day_id, user_id)
        if plan_day is None:
            raise NotFoundError("Plan day not found")

    # Best weight ever lifted per exercise, before this session's sets are
    # considered — a set is a PR if it beats this (or is the first-ever set
    # logged for that exercise). Tracked per-exercise as we walk the sets so
    # multiple progressively heavier sets in one session can each be a PR.
    best_weight: dict[int, float] = {}
    log_sets = []
    for s in data.sets:
        is_pr = False
        if s.weight_kg is not None:
            prior_best = best_weight.get(
                s.exercise_id, workout_log_repo.get_best_weight(db, user_id, s.exercise_id)
            )
            if prior_best is None or s.weight_kg > prior_best:
                is_pr = True
                best_weight[s.exercise_id] = s.weight_kg
            else:
                best_weight[s.exercise_id] = prior_best
        log_sets.append(
            LogSet(
                exercise_id=s.exercise_id,
                weight_kg=s.weight_kg,
                reps=s.reps,
                set_number=s.set_number,
                is_personal_record=is_pr,
            )
        )

    log = WorkoutLog(
        user_id=user_id,
        plan_day_id=data.plan_day_id,
        completed_at=data.completed_at or date.today(),
        status=data.status,
        log_sets=log_sets,
    )
    return workout_log_repo.create(db, log)


def list_logs(db: Session, user_id: int) -> list[WorkoutLog]:
    return workout_log_repo.list_for_user(db, user_id)


def list_personal_records(db: Session, user_id: int) -> list[PersonalRecordRead]:
    log_sets = workout_log_repo.list_personal_records(db, user_id)
    return [
        PersonalRecordRead(
            id=log_set.id,
            exercise=log_set.exercise,
            weight_kg=log_set.weight_kg,
            reps=log_set.reps,
            set_number=log_set.set_number,
            completed_at=log_set.workout_log.completed_at,
        )
        for log_set in log_sets
    ]
