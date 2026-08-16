"""add subscriptions table

Revision ID: a3f6c1d9e7b4
Revises: b9c7e8f0a1b2
Create Date: 2026-08-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f6c1d9e7b4'
down_revision: Union[str, None] = 'b9c7e8f0a1b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'subscriptions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('plan', sa.Enum('free', 'pro', name='plan'), nullable=False, server_default='free'),
        sa.Column(
            'status',
            sa.Enum('active', 'cancelled', 'expired', name='subscriptionstatus'),
            nullable=False,
            server_default='active',
        ),
        sa.Column('store_product_id', sa.String(length=255), nullable=True),
        sa.Column('current_period_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('subscriptions')
    sa.Enum(name='plan').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='subscriptionstatus').drop(op.get_bind(), checkfirst=True)
