"""add image_url to exercises

Revision ID: eab6782ee13c
Revises: 2a8f100e2e52
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'eab6782ee13c'
down_revision: Union[str, None] = '2a8f100e2e52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('exercises', sa.Column('image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('exercises', 'image_url')
