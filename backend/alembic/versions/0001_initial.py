"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-24
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_table(
        "learning_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.Enum("video", "playlist", name="learningitemtype"), nullable=False),
        sa.Column("youtube_id", sa.String(255), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("thumbnail", sa.Text()),
        sa.Column("channel_name", sa.String(255)),
        sa.Column("total_duration", sa.Integer(), nullable=False),
        sa.Column("target_days", sa.Integer(), nullable=False),
        sa.Column("status", sa.Enum("active", "completed", "paused", name="learningstatus"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "learning_videos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("learning_item_id", sa.Integer(), sa.ForeignKey("learning_items.id"), nullable=False),
        sa.Column("youtube_id", sa.String(255), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("thumbnail", sa.Text()),
        sa.Column("channel_name", sa.String(255)),
        sa.Column("duration", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
    )
    op.create_table(
        "roadmaps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("learning_item_id", sa.Integer(), sa.ForeignKey("learning_items.id"), nullable=False),
        sa.Column("day_number", sa.Integer(), nullable=False),
        sa.Column("start_video", sa.String(255), nullable=False),
        sa.Column("start_timestamp", sa.Integer(), nullable=False),
        sa.Column("end_video", sa.String(255), nullable=False),
        sa.Column("end_timestamp", sa.Integer(), nullable=False),
        sa.Column("daily_target_minutes", sa.Integer(), nullable=False),
    )
    op.create_table(
        "progress",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("learning_item_id", sa.Integer(), sa.ForeignKey("learning_items.id"), nullable=False),
        sa.Column("last_watched_video", sa.String(255)),
        sa.Column("last_watched_timestamp", sa.Integer(), nullable=False),
        sa.Column("completion_percentage", sa.Integer(), nullable=False),
        sa.Column("completed_minutes", sa.Integer(), nullable=False),
        sa.Column("current_streak", sa.Integer(), nullable=False),
        sa.Column("longest_streak", sa.Integer(), nullable=False),
        sa.Column("last_completed_on", sa.Date()),
    )
    op.create_table(
        "reminders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("learning_item_id", sa.Integer(), sa.ForeignKey("learning_items.id"), nullable=False),
        sa.Column("reminder_time", sa.String(5), nullable=False),
        sa.Column("notification_enabled", sa.Boolean(), nullable=False),
        sa.Column("fcm_token", sa.String(512)),
    )


def downgrade() -> None:
    for table in ["reminders", "progress", "roadmaps", "learning_videos", "learning_items", "users"]:
        op.drop_table(table)
