# FitForge

Fitness tracking app: workout planning, nutrition logging, and progress analytics.

## Architecture

```
.
├── fitforge-backend/       # FastAPI + SQLAlchemy + Celery API
├── fitforge-mobile/        # React Native (Expo) app
├── fitforge-subscriptions/ # Spring Boot billing & entitlement service (port 8081)
├── shared/                 # Shared API type contracts
└── .github/                # CI workflows
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

Set env vars in `.env`:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:8000/api/v1` |
| `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` | RevenueCat Apple public SDK key (for in-app purchases) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | RevenueCat Google public SDK key (for in-app purchases) |

### Health data

`useHealthSync` reads Apple HealthKit samples (steps, workouts, heart rate) on iOS via
`expo-health-kit`. It requires a development build (not Expo Go) and the
`expo-health-kit` config plugin already declared in `app.config.ts`.

## Subscriptions

`fitforge-subscriptions` is a Spring Boot service that resolves entitlements. The backend
proxies to it over HTTP.

```bash
cd fitforge-subscriptions
mvn spring-boot:run
```

Set in `fitforge-backend/.env`:

| Variable | Default |
| --- | --- |
| `SUBSCRIPTION_SERVICE_URL` | `http://localhost:8081` |
| `ENTITLEMENTS_TIMEOUT_SECONDS` | `2.0` |

Endpoints:

- `GET  /entitlements/{userId}` — current subscription/entitlement
- `POST /entitlements/{userId}/purchase` — upgrade to Pro (30-day period)
- `POST /entitlements/{userId}/cancel` — mark subscription cancelled
- `POST /webhooks/revenuecat` — RevenueCat webhook (initial purchase/renewal/cancellation/expiration)

Pro-gated routes on the backend use the `RequiresPro` dependency (returns HTTP `402` for
free users), e.g. `GET /api/v1/analytics/summary`. The RevenueCat SDK fires webhooks for real
store purchases; the backend `POST /api/v1/subscriptions/purchase|cancel` routes let the app
apply/reflect changes immediately.

## Daily workout plans

The app suggests a free 5-day training split (Hevy's Bro Split — Chest / Back / Shoulders &
Traps / Legs & Abs / Arms, Monday–Friday, with the weekend as rest) through the backend:

- `GET /api/v1/plans/daily?offset=0` — today's plan (offset 0–6 shifts days)
- `GET /api/v1/plans/week` — all seven days

The plan data lives in `fitforge-backend/app/services/workout_plan_service.py` as plain
structured data, so it is trivial to customize or replace. It is surfaced in the mobile app on
the **Exercise** screen.

Source: [Hevy's free 5-Day Bro Split guide](https://www.hevyapp.com/bro-split-workout-program-guide/).

## Full stack with Docker

```bash
docker compose up
```