from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class LearningItemType(str, Enum):
    video = "video"
    playlist = "playlist"


class LearningStatus(str, Enum):
    active = "active"
    completed = "completed"
    paused = "paused"


class LearningItem(Base):
    __tablename__ = "learning_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[LearningItemType] = mapped_column(SAEnum(LearningItemType), nullable=False)
    youtube_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail: Mapped[str | None] = mapped_column(Text)
    channel_name: Mapped[str | None] = mapped_column(String(255))
    total_duration: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    target_days: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[LearningStatus] = mapped_column(SAEnum(LearningStatus), default=LearningStatus.active)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="learning_items")
    videos = relationship("LearningVideo", back_populates="learning_item", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="learning_item", cascade="all, delete-orphan", order_by="Roadmap.day_number")
    progress = relationship("Progress", back_populates="learning_item", cascade="all, delete-orphan", uselist=False)
    reminder = relationship("Reminder", back_populates="learning_item", cascade="all, delete-orphan", uselist=False)


class LearningVideo(Base):
    __tablename__ = "learning_videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    learning_item_id: Mapped[int] = mapped_column(ForeignKey("learning_items.id"), nullable=False, index=True)
    youtube_id: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thumbnail: Mapped[str | None] = mapped_column(Text)
    channel_name: Mapped[str | None] = mapped_column(String(255))
    duration: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    learning_item = relationship("LearningItem", back_populates="videos")
