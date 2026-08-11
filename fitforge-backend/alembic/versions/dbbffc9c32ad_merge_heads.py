"""merge heads

Revision ID: dbbffc9c32ad
Revises: 74d97ecd611a, f3b1a9c7d2e4
Create Date: 2026-08-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dbbffc9c32ad'
down_revision: Union[str, None] = ('74d97ecd611a', 'f3b1a9c7d2e4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
