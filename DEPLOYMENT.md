# StudyTube Deployment Guide

## Backend on Render

1. Create a new Render Web Service from the repository.
2. Set root directory to `backend`.
3. Build command:

```bash
pip install -r requirements.txt
```

4. Start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Add environment variables:

```env
ENVIRONMENT=production
DATABASE_URL=mysql+pymysql://USER:PASSWORD@HOST:3306/DATABASE
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
YOUTUBE_API_KEY=your-youtube-data-api-key
FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
FRONTEND_ORIGINS=https://your-vercel-app.vercel.app
```

6. Run migrations from the Render shell:

```bash
alembic upgrade head
```

## MySQL

Create a MySQL database and user:

```sql
CREATE DATABASE studytube CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'studytube'@'%' IDENTIFIED BY 'strong-password';
GRANT ALL PRIVILEGES ON studytube.* TO 'studytube'@'%';
FLUSH PRIVILEGES;
```

Use the hosted provider connection string as `DATABASE_URL`.

## Frontend on Vercel

1. Create a new Vercel project from the repository.
2. Set root directory to `frontend`.
3. Build command:

```bash
npm run build
```

4. Output directory:

```text
dist
```

5. Add environment variables:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Production Checklist

- Use a strong `JWT_SECRET_KEY`.
- Set `ENVIRONMENT=production` so schemas are managed by Alembic instead of startup table creation.
- Restrict `FRONTEND_ORIGINS` to deployed domains.
- Enable HTTPS-only cookies if you later move JWTs from local storage to cookies.
- Add a scheduled worker for reminder dispatch.
- Configure Google Cloud quota alerts for YouTube Data API.
- Add database backups and monitoring.
