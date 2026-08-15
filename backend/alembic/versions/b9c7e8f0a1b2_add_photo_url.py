"""add photo_url to body_measurements

Revision ID: b9c7e8f0a1b2
Revises: a7b3d2e4f5a6
Create Date: 2026-08-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'b9c7e8f0a1b2'
down_revision: Union[str, None] = 'a7b3d2e4f5a6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'body_measurements',
        sa.Column('photo_url', sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('body_measurements', 'photo_url')
