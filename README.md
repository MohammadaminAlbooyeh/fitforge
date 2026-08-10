# FitForge

Fitness tracking app: workout planning, nutrition logging, and progress analytics.

## Architecture

```
.
├── fitforge-backend/   # FastAPI + SQLAlchemy + Celery API
├── fitforge-mobile/    # React Native (Expo) app
├── shared/             # Shared API type contracts
└── .github/            # CI workflows
```

## Backend

FastAPI application with layered structure: api → services → repositories → models.

```bash
cd fitforge-backend
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# dev database only (postgres + redis)
docker compose up -d db redis

# run migrations
alembic upgrade head

# start API and Celery worker
uvicorn app.main:app --reload
celery -A app.core.celery_app.celery_app worker --loglevel=info
```

Tests run with `pytest` (uses an in-memory SQLite DB).

## Mobile

Expo + React Native app.

```bash
cd fitforge-mobile
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `.env` to point at your backend.

## Full stack with Docker

```bash
docker compose up
```