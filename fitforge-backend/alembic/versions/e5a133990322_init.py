"""init

Revision ID: e5a133990322
Revises: 
Create Date: 2026-08-10 17:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'e5a133990322'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('gender', sa.Enum('male', 'female', 'other', name='gender'), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('height_cm', sa.Float(), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('goal', sa.Enum('lose_weight', 'gain_muscle', 'maintain', name='fitnessgoal'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    op.create_table(
        'exercises',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('muscle_group', sa.Enum('chest', 'back', 'legs', 'shoulders', 'arms', 'core', name='musclegroup'), nullable=False),
        sa.Column('instructions', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exercises_name'), 'exercises', ['name'], unique=True)

    op.create_table(
        'workouts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheduled_at', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workouts_user_id'), 'workouts', ['user_id'], unique=False)

    op.create_table(
        'workout_exercises',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('workout_id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('sets', sa.Integer(), server_default='3', nullable=False),
        sa.Column('reps', sa.Integer(), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['exercise_id'], ['exercises.id'], ),
        sa.ForeignKeyConstraint(['workout_id'], ['workouts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'nutrition_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('log_date', sa.Date(), nullable=False),
        sa.Column('meal', sa.String(length=50), nullable=True),
        sa.Column('food_item', sa.String(length=255), nullable=False),
        sa.Column('calories', sa.Float(), server_default='0', nullable=False),
        sa.Column('protein_g', sa.Float(), server_default='0', nullable=False),
        sa.Column('carbs_g', sa.Float(), server_default='0', nullable=False),
        sa.Column('fat_g', sa.Float(), server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_nutrition_logs_log_date'), 'nutrition_logs', ['log_date'], unique=False)
    op.create_index(op.f('ix_nutrition_logs_user_id'), 'nutrition_logs', ['user_id'], unique=False)

    op.create_table(
        'workout_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('workout_id', sa.Integer(), nullable=False),
        sa.Column('performed_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('sets', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['workout_id'], ['workouts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_workout_sessions_user_id'), 'workout_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_workout_sessions_workout_id'), 'workout_sessions', ['workout_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_workout_sessions_workout_id'), table_name='workout_sessions')
    op.drop_index(op.f('ix_workout_sessions_user_id'), table_name='workout_sessions')
    op.drop_table('workout_sessions')
    op.drop_index(op.f('ix_nutrition_logs_user_id'), table_name='nutrition_logs')
    op.drop_index(op.f('ix_nutrition_logs_log_date'), table_name='nutrition_logs')
    op.drop_table('nutrition_logs')
    op.drop_table('workout_exercises')
    op.drop_index(op.f('ix_workouts_user_id'), table_name='workouts')
    op.drop_table('workouts')
    op.drop_index(op.f('ix_exercises_name'), table_name='exercises')
    op.drop_table('exercises')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    gender_enum = sa.Enum(name='gender')
    gender_enum.drop(op.get_bind(), checkfirst=True)
    fitnessgoal_enum = sa.Enum(name='fitnessgoal')
    fitnessgoal_enum.drop(op.get_bind(), checkfirst=True)
    musclegroup_enum = sa.Enum(name='musclegroup')
    musclegroup_enum.drop(op.get_bind(), checkfirst=True)
