import json

import firebase_admin
from firebase_admin import credentials, messaging

from app.config import get_settings


class NotificationService:
    def __init__(self) -> None:
        settings = get_settings()
        self.enabled = bool(settings.firebase_credentials_json)
        if self.enabled and not firebase_admin._apps:
            creds = credentials.Certificate(json.loads(settings.firebase_credentials_json))
            firebase_admin.initialize_app(creds)

    def send_daily_goal(self, token: str, title: str, minutes: int) -> str | None:
        if not self.enabled:
            return None
        message = messaging.Message(
            notification=messaging.Notification(
                title="Today's StudyTube goal",
                body=f"Watch {minutes} minutes of {title}.",
            ),
            token=token,
        )
        return messaging.send(message)
