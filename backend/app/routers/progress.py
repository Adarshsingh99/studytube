from datetime import date, timedelta
from math import ceil

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.learning_item import LearningItem, LearningStatus
from app.models.progress import Progress
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.progress import ProgressRead, ProgressUpdate
from app.services.roadmap_service import build_roadmap
from app.utils.auth.dependencies import get_current_user


router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/{item_id}", response_model=ProgressRead)
def get_progress(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Progress:
    progress = _get_progress(item_id, user, db)
    return progress


@router.patch("/{item_id}", response_model=ProgressRead)
def update_progress(item_id: int, payload: ProgressUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Progress:
    item = _get_item(item_id, user, db)
    progress = _get_progress(item_id, user, db)
    progress.last_watched_video = payload.last_watched_video or progress.last_watched_video
    progress.last_watched_timestamp = payload.last_watched_timestamp
    total_minutes = max(1, ceil(item.total_duration / 60))
    progress.completed_minutes = min(payload.completed_minutes, total_minutes)
    progress.completion_percentage = min(100, round((progress.completed_minutes * 60 / max(1, item.total_duration)) * 100))

    if payload.mark_day_complete:
        today = date.today()
        if progress.last_completed_on == today - timedelta(days=1):
            progress.current_streak += 1
        elif progress.last_completed_on != today:
            progress.current_streak = 1
        progress.longest_streak = max(progress.longest_streak, progress.current_streak)
        progress.last_completed_on = today

    if progress.completion_percentage >= 100:
        item.status = LearningStatus.completed
    db.commit()
    db.refresh(progress)
    return progress


@router.post("/{item_id}/recalculate", response_model=list[dict])
def recalculate_roadmap(item_id: int, remaining_days: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    item = _get_item(item_id, user, db)
    remaining_days = max(1, remaining_days)
    db.execute(delete(Roadmap).where(Roadmap.learning_item_id == item.id))
    db.flush()
    roadmaps = build_roadmap(item.id, item.videos, remaining_days)
    db.add_all(roadmaps)
    db.commit()
    return [{"day_number": row.day_number, "daily_target_minutes": row.daily_target_minutes} for row in roadmaps]


def _get_item(item_id: int, user: User, db: Session) -> LearningItem:
    item = db.scalar(select(LearningItem).where(LearningItem.id == item_id, LearningItem.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Learning item not found")
    return item


def _get_progress(item_id: int, user: User, db: Session) -> Progress:
    progress = db.scalar(select(Progress).where(Progress.learning_item_id == item_id, Progress.user_id == user.id))
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress
