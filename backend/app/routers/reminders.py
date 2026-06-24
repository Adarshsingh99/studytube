from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.learning_item import LearningItem
from app.models.reminder import Reminder
from app.models.user import User
from app.schemas.reminder import ReminderRead, ReminderUpsert
from app.utils.auth.dependencies import get_current_user


router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.put("/{item_id}", response_model=ReminderRead)
def upsert_reminder(item_id: int, payload: ReminderUpsert, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Reminder:
    item = db.scalar(select(LearningItem).where(LearningItem.id == item_id, LearningItem.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Learning item not found")
    reminder = db.scalar(select(Reminder).where(Reminder.learning_item_id == item_id, Reminder.user_id == user.id))
    if not reminder:
        reminder = Reminder(user_id=user.id, learning_item_id=item_id)
        db.add(reminder)
    reminder.reminder_time = payload.reminder_time
    reminder.notification_enabled = payload.notification_enabled
    reminder.fcm_token = payload.fcm_token
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("/{item_id}", response_model=ReminderRead | None)
def get_reminder(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Reminder | None:
    return db.scalar(select(Reminder).where(Reminder.learning_item_id == item_id, Reminder.user_id == user.id))
