from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    learning_item_id: Mapped[int] = mapped_column(ForeignKey("learning_items.id"), nullable=False, index=True)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    start_video: Mapped[str] = mapped_column(String(255), nullable=False)
    start_timestamp: Mapped[int] = mapped_column(Integer, nullable=False)
    end_video: Mapped[str] = mapped_column(String(255), nullable=False)
    end_timestamp: Mapped[int] = mapped_column(Integer, nullable=False)
    daily_target_minutes: Mapped[int] = mapped_column(Integer, nullable=False)

    learning_item = relationship("LearningItem", back_populates="roadmaps")
