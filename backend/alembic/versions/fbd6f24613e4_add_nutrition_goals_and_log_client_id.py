"""add nutrition goals and workout log client_id

Revision ID: fbd6f24613e4
Revises: a3f6c1d9e7b4
Create Date: 2026-08-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'fbd6f24613e4'
down_revision: Union[str, None] = 'a3f6c1d9e7b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'nutrition_goals',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('daily_calories', sa.Float(), nullable=True),
        sa.Column('protein_g', sa.Float(), nullable=True),
        sa.Column('carbs_g', sa.Float(), nullable=True),
        sa.Column('fat_g', sa.Float(), nullable=True),
    )
    op.create_index('ix_nutrition_goals_user_id', 'nutrition_goals', ['user_id'])

    op.add_column('workout_logs', sa.Column('client_id', sa.String(length=64), nullable=True))
    op.create_unique_constraint(
        'uq_workout_logs_user_client_id', 'workout_logs', ['user_id', 'client_id']
    )


def downgrade() -> None:
    op.drop_constraint('uq_workout_logs_user_client_id', 'workout_logs', type_='unique')
    op.drop_column('workout_logs', 'client_id')

    op.drop_index('ix_nutrition_goals_user_id', table_name='nutrition_goals')
    op.drop_table('nutrition_goals')
