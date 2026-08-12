"""add is_personal_record to log_sets and skipped to plan_day_exercises

Revision ID: f3b1a9c7d2e4
Revises: eab6782ee13c
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f3b1a9c7d2e4'
down_revision: Union[str, None] = 'eab6782ee13c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'log_sets',
        sa.Column('is_personal_record', sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column(
        'plan_day_exercises',
        sa.Column('skipped', sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column('plan_day_exercises', 'skipped')
    op.drop_column('log_sets', 'is_personal_record')
