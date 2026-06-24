from math import ceil

from app.models.learning_item import LearningVideo
from app.models.roadmap import Roadmap


def build_roadmap(learning_item_id: int, videos: list[LearningVideo], target_days: int) -> list[Roadmap]:
    total_seconds = sum(video.duration for video in videos)
    daily_seconds = max(60, ceil(total_seconds / target_days))
    roadmaps: list[Roadmap] = []
    cursor = 0

    for day in range(1, target_days + 1):
        if cursor >= total_seconds:
            break
        day_start = cursor
        day_end = min(total_seconds, cursor + daily_seconds)
        start_video, start_ts = locate_video_timestamp(videos, day_start)
        end_video, end_ts = locate_video_timestamp(videos, day_end)
        roadmaps.append(
            Roadmap(
                learning_item_id=learning_item_id,
                day_number=day,
                start_video=start_video,
                start_timestamp=start_ts,
                end_video=end_video,
                end_timestamp=end_ts,
                daily_target_minutes=ceil((day_end - day_start) / 60),
            )
        )
        cursor = day_end
    return roadmaps


def locate_video_timestamp(videos: list[LearningVideo], absolute_seconds: int) -> tuple[str, int]:
    elapsed = 0
    for video in videos:
        if absolute_seconds <= elapsed + video.duration:
            return video.youtube_id, max(0, absolute_seconds - elapsed)
        elapsed += video.duration
    last = videos[-1]
    return last.youtube_id, last.duration


def seconds_to_youtube_timestamp(seconds: int) -> str:
    return f"{max(0, seconds)}s"
