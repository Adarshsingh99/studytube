import math
import re
from dataclasses import dataclass
from urllib.parse import parse_qs, urlparse

import requests
from fastapi import HTTPException

from app.config import get_settings


YOUTUBE_API = "https://www.googleapis.com/youtube/v3"


@dataclass
class YouTubeVideo:
    youtube_id: str
    title: str
    thumbnail: str | None
    channel_name: str | None
    duration: int
    position: int = 1


@dataclass
class YouTubeItem:
    type: str
    youtube_id: str
    title: str
    thumbnail: str | None
    channel_name: str | None
    total_duration: int
    videos: list[YouTubeVideo]


def parse_duration(value: str) -> int:
    match = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value)
    if not match:
        return 0
    days, hours, minutes, seconds = [int(part or 0) for part in match.groups()]
    return days * 86400 + hours * 3600 + minutes * 60 + seconds


def parse_youtube_url(url: str) -> tuple[str, str]:
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    if "list" in query:
        return "playlist", query["list"][0]
    if "v" in query:
        return "video", query["v"][0]
    if parsed.netloc.endswith("youtu.be") and parsed.path.strip("/"):
        return "video", parsed.path.strip("/")
    raise HTTPException(status_code=400, detail="Paste a valid YouTube video or playlist URL")


class YouTubeService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def fetch_item(self, url: str) -> YouTubeItem:
        item_type, youtube_id = parse_youtube_url(url)
        if not self.settings.youtube_api_key:
            return self._fetch_demo_item(url, item_type, youtube_id)
        if item_type == "video":
            video = self._fetch_videos([youtube_id])[0]
            return YouTubeItem("video", youtube_id, video.title, video.thumbnail, video.channel_name, video.duration, [video])
        return self._fetch_playlist(youtube_id)

    def _request(self, endpoint: str, params: dict) -> dict:
        params["key"] = self.settings.youtube_api_key
        response = requests.get(f"{YOUTUBE_API}/{endpoint}", params=params, timeout=15)
        if not response.ok:
            raise HTTPException(status_code=response.status_code, detail="YouTube API request failed")
        return response.json()

    def _fetch_videos(self, video_ids: list[str]) -> list[YouTubeVideo]:
        videos: list[YouTubeVideo] = []
        for index in range(0, len(video_ids), 50):
            chunk = video_ids[index : index + 50]
            data = self._request("videos", {"part": "snippet,contentDetails", "id": ",".join(chunk)})
            for position, item in enumerate(data.get("items", []), start=index + 1):
                snippet = item["snippet"]
                videos.append(
                    YouTubeVideo(
                        youtube_id=item["id"],
                        title=snippet["title"],
                        thumbnail=snippet.get("thumbnails", {}).get("high", {}).get("url"),
                        channel_name=snippet.get("channelTitle"),
                        duration=parse_duration(item["contentDetails"].get("duration", "PT0S")),
                        position=position,
                    )
                )
        if not videos:
            raise HTTPException(status_code=404, detail="No public YouTube videos found")
        return videos

    def _fetch_playlist(self, playlist_id: str) -> YouTubeItem:
        video_ids: list[str] = []
        page_token: str | None = None
        while True:
            params = {"part": "snippet", "playlistId": playlist_id, "maxResults": 50}
            if page_token:
                params["pageToken"] = page_token
            data = self._request("playlistItems", params)
            for item in data.get("items", []):
                resource = item["snippet"].get("resourceId", {})
                if resource.get("kind") == "youtube#video":
                    video_ids.append(resource["videoId"])
            page_token = data.get("nextPageToken")
            if not page_token:
                break
        videos = self._fetch_videos(video_ids)
        first = videos[0]
        total_duration = sum(video.duration for video in videos)
        hours = math.ceil(total_duration / 3600)
        return YouTubeItem("playlist", playlist_id, f"{first.title} Playlist", first.thumbnail, first.channel_name, total_duration, videos)

    def _fetch_demo_item(self, url: str, item_type: str, youtube_id: str) -> YouTubeItem:
        if item_type == "video":
            title, thumbnail, channel = self._fetch_oembed(url, youtube_id)
            video = YouTubeVideo(youtube_id, title, thumbnail, channel, 45 * 60)
            return YouTubeItem("video", youtube_id, title, thumbnail, channel, video.duration, [video])

        videos = [
            YouTubeVideo(f"{youtube_id}-part-{index}", f"Playlist segment {index}", None, "YouTube Playlist", 35 * 60, index)
            for index in range(1, 5)
        ]
        return YouTubeItem(
            "playlist",
            youtube_id,
            "YouTube playlist study plan",
            None,
            "YouTube Playlist",
            sum(video.duration for video in videos),
            videos,
        )

    def _fetch_oembed(self, url: str, youtube_id: str) -> tuple[str, str | None, str | None]:
        try:
            response = requests.get("https://www.youtube.com/oembed", params={"url": url, "format": "json"}, timeout=10)
            if response.ok:
                payload = response.json()
                return payload.get("title", "YouTube video"), payload.get("thumbnail_url"), payload.get("author_name")
        except requests.RequestException:
            pass
        return f"YouTube video {youtube_id}", f"https://img.youtube.com/vi/{youtube_id}/hqdefault.jpg", "YouTube"
