from pydantic import BaseModel, Field


class ReminderUpsert(BaseModel):
    reminder_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    notification_enabled: bool = True
    fcm_token: str | None = None


class ReminderRead(BaseModel):
    id: int
    reminder_time: str
    notification_enabled: bool

    model_config = {"from_attributes": True}
