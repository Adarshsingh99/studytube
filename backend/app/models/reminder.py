from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    learning_item_id: Mapped[int] = mapped_column(ForeignKey("learning_items.id"), nullable=False, index=True)
    reminder_time: Mapped[str] = mapped_column(String(5), nullable=False, default="08:00")
    notification_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fcm_token: Mapped[str | None] = mapped_column(String(512))

    user = relationship("User", back_populates="reminders")
    learning_item = relationship("LearningItem", back_populates="reminder")
