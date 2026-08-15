"""add water_logs table

Revision ID: a7b3d2e4f5a6
Revises: c8a1f4e9b3d2
Create Date: 2026-08-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a7b3d2e4f5a6'
down_revision: Union[str, None] = 'c8a1f4e9b3d2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'water_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('log_date', sa.Date(), nullable=False),
        sa.Column('amount_ml', sa.Float(), nullable=False, server_default='250'),
    )
    op.create_index('ix_water_logs_user_id', 'water_logs', ['user_id'])
    op.create_index('ix_water_logs_log_date', 'water_logs', ['log_date'])


def downgrade() -> None:
    op.drop_index('ix_water_logs_log_date', table_name='water_logs')
    op.drop_index('ix_water_logs_user_id', table_name='water_logs')
    op.drop_table('water_logs')
