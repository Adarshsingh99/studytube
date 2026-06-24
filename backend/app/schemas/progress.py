from pydantic import BaseModel, Field


class ProgressUpdate(BaseModel):
    last_watched_video: str | None = None
    last_watched_timestamp: int = Field(ge=0)
    completed_minutes: int = Field(ge=0)
    mark_day_complete: bool = False


class ProgressRead(BaseModel):
    id: int
    last_watched_video: str | None
    last_watched_timestamp: int
    completion_percentage: int
    completed_minutes: int
    current_streak: int
    longest_streak: int

    model_config = {"from_attributes": True}
