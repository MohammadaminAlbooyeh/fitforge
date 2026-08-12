"""add workout plan engine (exercise library fields, plans, logs)

Revision ID: 2a8f100e2e52
Revises: e5a133990322
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '2a8f100e2e52'
down_revision: Union[str, None] = 'e5a133990322'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Postgres 12+ allows ADD VALUE inside a transaction as long as the new
    # value isn't used in the same transaction, which we don't need to here.
    for value in ('shoulders', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'glutes', 'calves'):
        op.execute(f"ALTER TYPE musclegroup ADD VALUE IF NOT EXISTS '{value}'")

    equipment_enum = sa.Enum(
        'bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'kettlebell', 'band',
        name='equipmenttype',
    )
    difficulty_enum = sa.Enum('beginner', 'intermediate', 'advanced', name='difficultylevel')
    movement_role_enum = sa.Enum('compound', 'isolation', name='movementrole')
    experience_enum = sa.Enum('beginner', 'intermediate', 'advanced', name='experiencelevel')
    split_type_enum = sa.Enum('full_body', 'upper_lower', 'push_pull_legs', name='splittype')
    plan_status_enum = sa.Enum('active', 'archived', name='planstatus')
    log_status_enum = sa.Enum('completed', 'partial', name='logstatus')

    # add_column (ALTER TABLE) does not auto-create the enum type, so these
    # need an explicit create. create_table below auto-creates its own enum
    # columns, so split_type_enum/plan_status_enum/log_status_enum must NOT
    # be pre-created here or Postgres raises "type already exists".
    bind = op.get_bind()
    equipment_enum.create(bind, checkfirst=True)
    difficulty_enum.create(bind, checkfirst=True)
    movement_role_enum.create(bind, checkfirst=True)
    experience_enum.create(bind, checkfirst=True)

    op.add_column(
        'exercises',
        sa.Column(
            'equipment', equipment_enum, nullable=False, server_default='bodyweight'
        ),
    )
    op.add_column(
        'exercises',
        sa.Column(
            'difficulty', difficulty_enum, nullable=False, server_default='beginner'
        ),
    )
    op.add_column(
        'exercises',
        sa.Column(
            'movement_role', movement_role_enum, nullable=False, server_default='isolation'
        ),
    )
    op.add_column('exercises', sa.Column('secondary_muscle_groups', sa.JSON(), nullable=True))
    op.add_column('exercises', sa.Column('video_url', sa.String(length=500), nullable=True))
    op.add_column(
        'exercises', sa.Column('alternative_exercise_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_exercises_alternative_exercise_id',
        'exercises',
        'exercises',
        ['alternative_exercise_id'],
        ['id'],
    )
    op.create_index(op.f('ix_exercises_muscle_group'), 'exercises', ['muscle_group'], unique=False)
    op.create_index(op.f('ix_exercises_equipment'), 'exercises', ['equipment'], unique=False)
    op.create_index(op.f('ix_exercises_difficulty'), 'exercises', ['difficulty'], unique=False)
    op.create_index(op.f('ix_exercises_movement_role'), 'exercises', ['movement_role'], unique=False)

    op.add_column('users', sa.Column('experience_level', experience_enum, nullable=True))
    op.add_column('users', sa.Column('available_days_per_week', sa.Integer(), nullable=True))
    op.add_column('users', sa.Column('available_equipment', sa.JSON(), nullable=True))

    op.create_table(
        'workout_plans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('days_per_week', sa.Integer(), nullable=False),
        sa.Column('split_type', split_type_enum, nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('status', plan_status_enum, nullable=False, server_default='active'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workout_plans_user_id'), 'workout_plans', ['user_id'], unique=False)
    op.create_index(op.f('ix_workout_plans_status'), 'workout_plans', ['status'], unique=False)

    op.create_table(
        'plan_days',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('workout_plan_id', sa.Integer(), nullable=False),
        sa.Column('day_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('weekday', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['workout_plan_id'], ['workout_plans.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_plan_days_workout_plan_id'), 'plan_days', ['workout_plan_id'], unique=False)

    op.create_table(
        'plan_day_exercises',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('plan_day_id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('sets', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('reps_range', sa.String(length=20), nullable=False, server_default='8-12'),
        sa.Column('rest_seconds', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['plan_day_id'], ['plan_days.id']),
        sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_plan_day_exercises_plan_day_id'), 'plan_day_exercises', ['plan_day_id'], unique=False
    )
    op.create_index(
        op.f('ix_plan_day_exercises_exercise_id'), 'plan_day_exercises', ['exercise_id'], unique=False
    )

    op.create_table(
        'workout_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('plan_day_id', sa.Integer(), nullable=True),
        sa.Column('completed_at', sa.Date(), nullable=False),
        sa.Column('status', log_status_enum, nullable=False, server_default='completed'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['plan_day_id'], ['plan_days.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_workout_logs_user_id'), 'workout_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_workout_logs_plan_day_id'), 'workout_logs', ['plan_day_id'], unique=False)

    op.create_table(
        'log_sets',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('workout_log_id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('reps', sa.Integer(), nullable=False),
        sa.Column('set_number', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['workout_log_id'], ['workout_logs.id']),
        sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_log_sets_workout_log_id'), 'log_sets', ['workout_log_id'], unique=False)
    op.create_index(op.f('ix_log_sets_exercise_id'), 'log_sets', ['exercise_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_log_sets_exercise_id'), table_name='log_sets')
    op.drop_index(op.f('ix_log_sets_workout_log_id'), table_name='log_sets')
    op.drop_table('log_sets')

    op.drop_index(op.f('ix_workout_logs_plan_day_id'), table_name='workout_logs')
    op.drop_index(op.f('ix_workout_logs_user_id'), table_name='workout_logs')
    op.drop_table('workout_logs')

    op.drop_index(op.f('ix_plan_day_exercises_exercise_id'), table_name='plan_day_exercises')
    op.drop_index(op.f('ix_plan_day_exercises_plan_day_id'), table_name='plan_day_exercises')
    op.drop_table('plan_day_exercises')

    op.drop_index(op.f('ix_plan_days_workout_plan_id'), table_name='plan_days')
    op.drop_table('plan_days')

    op.drop_index(op.f('ix_workout_plans_status'), table_name='workout_plans')
    op.drop_index(op.f('ix_workout_plans_user_id'), table_name='workout_plans')
    op.drop_table('workout_plans')

    op.drop_column('users', 'available_equipment')
    op.drop_column('users', 'available_days_per_week')
    op.drop_column('users', 'experience_level')

    op.drop_index(op.f('ix_exercises_movement_role'), table_name='exercises')
    op.drop_index(op.f('ix_exercises_difficulty'), table_name='exercises')
    op.drop_index(op.f('ix_exercises_equipment'), table_name='exercises')
    op.drop_index(op.f('ix_exercises_muscle_group'), table_name='exercises')
    op.drop_constraint('fk_exercises_alternative_exercise_id', 'exercises', type_='foreignkey')
    op.drop_column('exercises', 'alternative_exercise_id')
    op.drop_column('exercises', 'video_url')
    op.drop_column('exercises', 'secondary_muscle_groups')
    op.drop_column('exercises', 'movement_role')
    op.drop_column('exercises', 'difficulty')
    op.drop_column('exercises', 'equipment')

    sa.Enum(name='logstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='planstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='splittype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='experiencelevel').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='movementrole').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='difficultylevel').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='equipmenttype').drop(op.get_bind(), checkfirst=True)

    # Note: Postgres cannot easily remove enum VALUEs added to musclegroup;
    # a full downgrade of that would require rebuilding the type.
