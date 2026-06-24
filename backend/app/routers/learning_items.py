from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.database.session import get_db
from app.models.learning_item import LearningItem, LearningItemType, LearningVideo
from app.models.progress import Progress
from app.models.reminder import Reminder
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.learning_item import AddLearningItemRequest, DashboardStats, LearningItemRead
from app.schemas.roadmap import RoadmapRead
from app.services.roadmap_service import build_roadmap
from app.services.youtube_service import YouTubeService
from app.utils.auth.dependencies import get_current_user


router = APIRouter(prefix="/learning-items", tags=["learning-items"])


@router.get("", response_model=list[LearningItemRead])
def list_learning_items(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[LearningItem]:
    return list(
        db.scalars(
            select(LearningItem)
            .where(LearningItem.user_id == user.id)
            .options(selectinload(LearningItem.videos), selectinload(LearningItem.progress))
            .order_by(LearningItem.created_at.desc())
        )
    )


@router.post("", response_model=LearningItemRead, status_code=status.HTTP_201_CREATED)
def add_learning_item(payload: AddLearningItemRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LearningItem:
    metadata = YouTubeService().fetch_item(str(payload.url))
    item = LearningItem(
        user_id=user.id,
        type=LearningItemType(metadata.type),
        youtube_id=metadata.youtube_id,
        title=metadata.title,
        thumbnail=metadata.thumbnail,
        channel_name=metadata.channel_name,
        total_duration=metadata.total_duration,
        target_days=payload.target_days,
    )
    db.add(item)
    db.flush()

    videos = [
        LearningVideo(
            learning_item_id=item.id,
            youtube_id=video.youtube_id,
            title=video.title,
            thumbnail=video.thumbnail,
            channel_name=video.channel_name,
            duration=video.duration,
            position=video.position,
        )
        for video in metadata.videos
    ]
    db.add_all(videos)
    db.flush()
    db.add_all(build_roadmap(item.id, videos, payload.target_days))
    db.add(Progress(user_id=user.id, learning_item_id=item.id, last_watched_video=videos[0].youtube_id if videos else None))
    if payload.reminder_time:
        db.add(Reminder(user_id=user.id, learning_item_id=item.id, reminder_time=payload.reminder_time))
    db.commit()
    db.refresh(item)
    return db.scalar(
        select(LearningItem)
        .where(LearningItem.id == item.id)
        .options(selectinload(LearningItem.videos), selectinload(LearningItem.progress))
    )


@router.get("/dashboard", response_model=DashboardStats)
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardStats:
    items = list(db.scalars(select(LearningItem).where(LearningItem.user_id == user.id)))
    progress = list(db.scalars(select(Progress).where(Progress.user_id == user.id)))
    total_courses = len(items)
    completed_courses = sum(1 for item in items if item.status.value == "completed")
    total_percent = sum(p.completion_percentage for p in progress)
    return DashboardStats(
        total_courses=total_courses,
        active_courses=sum(1 for item in items if item.status.value == "active"),
        completed_courses=completed_courses,
        total_study_time=sum(p.completed_minutes for p in progress),
        current_streak=max((p.current_streak for p in progress), default=0),
        completion_percentage=round(total_percent / total_courses) if total_courses else 0,
    )


@router.get("/{item_id}", response_model=LearningItemRead)
def get_learning_item(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> LearningItem:
    item = db.scalar(
        select(LearningItem)
        .where(LearningItem.id == item_id, LearningItem.user_id == user.id)
        .options(selectinload(LearningItem.videos), selectinload(LearningItem.progress))
    )
    if not item:
        raise HTTPException(status_code=404, detail="Learning item not found")
    return item


@router.get("/{item_id}/roadmap", response_model=list[RoadmapRead])
def get_roadmap(item_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Roadmap]:
    item_exists = db.scalar(select(func.count()).select_from(LearningItem).where(LearningItem.id == item_id, LearningItem.user_id == user.id))
    if not item_exists:
        raise HTTPException(status_code=404, detail="Learning item not found")
    return list(db.scalars(select(Roadmap).where(Roadmap.learning_item_id == item_id).order_by(Roadmap.day_number)))
