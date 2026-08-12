"""add target_weight_kg to plan_day_exercises

Revision ID: c8a1f4e9b3d2
Revises: dbbffc9c32ad
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c8a1f4e9b3d2'
down_revision: Union[str, None] = 'dbbffc9c32ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'plan_day_exercises',
        sa.Column('target_weight_kg', sa.Float(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('plan_day_exercises', 'target_weight_kg')
