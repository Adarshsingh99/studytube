from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Progress(Base):
    __tablename__ = "progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    learning_item_id: Mapped[int] = mapped_column(ForeignKey("learning_items.id"), nullable=False, index=True)
    last_watched_video: Mapped[str | None] = mapped_column(String(255))
    last_watched_timestamp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completion_percentage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_completed_on: Mapped[date | None] = mapped_column(Date)

    user = relationship("User", back_populates="progress_items")
    learning_item = relationship("LearningItem", back_populates="progress")
