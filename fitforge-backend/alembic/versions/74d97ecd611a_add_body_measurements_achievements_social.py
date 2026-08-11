"""add body measurements, achievements, social features

Revision ID: 74d97ecd611a
Revises: eab6782ee13c
Create Date: 2026-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '74d97ecd611a'
down_revision: Union[str, None] = 'eab6782ee13c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    challenge_status_enum = sa.Enum('active', 'completed', name='challengestatus')
    bind = op.get_bind()
    challenge_status_enum.create(bind, checkfirst=True)

    op.create_table(
        'body_measurements',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('body_fat_pct', sa.Float(), nullable=True),
        sa.Column('chest_cm', sa.Float(), nullable=True),
        sa.Column('waist_cm', sa.Float(), nullable=True),
        sa.Column('hips_cm', sa.Float(), nullable=True),
        sa.Column('arms_cm', sa.Float(), nullable=True),
        sa.Column('thighs_cm', sa.Float(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_body_measurements_user_id', 'body_measurements', ['user_id'], unique=False)
    op.create_index('ix_body_measurements_date', 'body_measurements', ['date'], unique=False)

    op.create_table(
        'achievements',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('badge_type', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=False),
        sa.Column('xp_earned', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('earned_at', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_achievements_user_id', 'achievements', ['user_id'], unique=False)
    op.create_index('ix_achievements_badge_type', 'achievements', ['badge_type'], unique=False)

    op.create_table(
        'user_xp',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('total_xp', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('streak_days', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('longest_streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_workout_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_xp_user_id', 'user_xp', ['user_id'], unique=False)

    op.create_table(
        'follows',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('follower_id', sa.Integer(), nullable=False),
        sa.Column('following_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['follower_id'], ['users.id']),
        sa.ForeignKeyConstraint(['following_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_follows_follower_id', 'follows', ['follower_id'], unique=False)
    op.create_index('ix_follows_following_id', 'follows', ['following_id'], unique=False)

    op.create_table(
        'challenges',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('target_workouts', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('status', challenge_status_enum, nullable=False, server_default='active'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_challenges_creator_id', 'challenges', ['creator_id'], unique=False)

    op.create_table(
        'challenge_participants',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('challenge_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('workouts_completed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_challenge_participants_challenge_id', 'challenge_participants', ['challenge_id'], unique=False)
    op.create_index('ix_challenge_participants_user_id', 'challenge_participants', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_challenge_participants_user_id', table_name='challenge_participants')
    op.drop_index('ix_challenge_participants_challenge_id', table_name='challenge_participants')
    op.drop_table('challenge_participants')

    op.drop_index('ix_challenges_creator_id', table_name='challenges')
    op.drop_table('challenges')

    op.drop_index('ix_follows_following_id', table_name='follows')
    op.drop_index('ix_follows_follower_id', table_name='follows')
    op.drop_table('follows')

    op.drop_index('ix_user_xp_user_id', table_name='user_xp')
    op.drop_table('user_xp')

    op.drop_index('ix_achievements_badge_type', table_name='achievements')
    op.drop_index('ix_achievements_user_id', table_name='achievements')
    op.drop_table('achievements')

    op.drop_index('ix_body_measurements_date', table_name='body_measurements')
    op.drop_index('ix_body_measurements_user_id', table_name='body_measurements')
    op.drop_table('body_measurements')

    sa.Enum(name='challengestatus').drop(op.get_bind(), checkfirst=True)
