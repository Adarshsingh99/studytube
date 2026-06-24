# StudyTube

StudyTube is a full-stack study planner for long YouTube videos and playlists. Users can register, paste a YouTube URL, choose a completion target, and get a daily roadmap with progress tracking, streaks, reminders, and resume links that open YouTube at the correct timestamp.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, React Query, Zustand, Recharts
- Backend: FastAPI, SQLAlchemy, Pydantic, Alembic, JWT authentication
- Database: MySQL in production, SQLite fallback for local development
- Notifications: Firebase Cloud Messaging integration point
- Deployment: Vercel frontend, Render backend, hosted MySQL

## Project Structure

```text
backend/
  app/
    main.py
    config.py
    database/
    models/
    schemas/
    routers/
    services/
    utils/auth/
  alembic/
  requirements.txt
frontend/
  src/
    pages/
    components/
    services/
    store/
    hooks/
    routes/
  package.json
```

## Local Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Set `DATABASE_URL` to MySQL for production-like development:

```env
DATABASE_URL=mysql+pymysql://studytube:studytube@localhost:3306/studytube
YOUTUBE_API_KEY=your-youtube-data-api-key
JWT_SECRET_KEY=replace-with-a-long-random-secret
```

In development, tables are created on startup. For production, run Alembic migrations:

```bash
cd backend
alembic upgrade head
```

## Local Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set:

```env
VITE_API_URL=http://localhost:8000/api
```

## Main API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/learning-items/dashboard`
- `GET /api/learning-items`
- `POST /api/learning-items`
- `GET /api/learning-items/{item_id}`
- `GET /api/learning-items/{item_id}/roadmap`
- `GET /api/progress/{item_id}`
- `PATCH /api/progress/{item_id}`
- `POST /api/progress/{item_id}/recalculate`
- `GET /api/reminders/{item_id}`
- `PUT /api/reminders/{item_id}`

## YouTube Integration

The backend uses the YouTube Data API v3 to fetch:

- Video and playlist metadata
- Titles
- Thumbnails
- Channel names
- Durations
- Playlist video ordering

Create a YouTube Data API key in Google Cloud Console and set `YOUTUBE_API_KEY`.

## Firebase Notifications

`NotificationService` is prepared for Firebase Cloud Messaging. Set `FIREBASE_CREDENTIALS_JSON` to a JSON string of a Firebase service account. The reminders API stores reminder times and optional FCM tokens; a production scheduler can call `NotificationService.send_daily_goal` at the configured times.

## Roadmap Logic

Roadmaps split total duration across target days. Playlist roadmaps use an absolute timeline and then map each daily segment back to the correct video and timestamp, so a day can start in one video and end in another.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel, Render, and MySQL setup.
