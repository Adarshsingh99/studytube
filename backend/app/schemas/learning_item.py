from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl

from app.models.learning_item import LearningItemType, LearningStatus


class AddLearningItemRequest(BaseModel):
    url: HttpUrl
    target_days: int = Field(ge=1, le=365)
    reminder_time: str | None = Field(default=None, pattern=r"^\d{2}:\d{2}$")


class LearningVideoRead(BaseModel):
    youtube_id: str
    title: str
    thumbnail: str | None
    channel_name: str | None
    duration: int
    position: int

    model_config = {"from_attributes": True}


class LearningProgressRead(BaseModel):
    completion_percentage: int
    completed_minutes: int

    model_config = {"from_attributes": True}


class LearningItemRead(BaseModel):
    id: int
    type: LearningItemType
    youtube_id: str
    title: str
    thumbnail: str | None
    channel_name: str | None
    total_duration: int
    target_days: int
    status: LearningStatus
    created_at: datetime
    videos: list[LearningVideoRead] = []
    progress: LearningProgressRead | None = None

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_courses: int
    active_courses: int
    completed_courses: int
    total_study_time: int
    current_streak: int
    completion_percentage: int
