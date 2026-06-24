from pydantic import BaseModel


class RoadmapRead(BaseModel):
    id: int
    day_number: int
    start_video: str
    start_timestamp: int
    end_video: str
    end_timestamp: int
    daily_target_minutes: int

    model_config = {"from_attributes": True}
