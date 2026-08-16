# FitForge

Fitness tracking app: workout planning, nutrition logging, and progress analytics.

## Architecture

```
.
├── backend/         # FastAPI + SQLAlchemy + Celery API
├── apps/mobile/     # React Native (Expo) app
├── apps/web/        # Next.js (App Router + Tailwind) web app
├── shared/          # Shared API type contracts
└── .github/         # CI workflows
```

## Backend

FastAPI application with layered structure: api → services → repositories → models.

```bash
cd backend
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
cd apps/mobile
npm install
npx expo start
```

Set env vars in `.env`:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL, e.g. `http://localhost:8000/api/v1` |
| `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY` | RevenueCat Apple public SDK key (for in-app purchases) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | RevenueCat Google public SDK key (for in-app purchases) |

### E2E tests (Maestro)

`apps/mobile/.maestro/flows/` covers login, register, paywall, and logging a workout session,
run against a real emulator/simulator build (unit tests with Jest don't exercise real
navigation/UI). Run locally with `maestro test apps/mobile/.maestro/flows/login.yaml` etc.
(after installing the [Maestro CLI](https://maestro.mobile.dev) and having the app running on a
simulator/emulator). `.github/workflows/mobile-e2e.yml` runs the full suite on an Android
emulator in CI; it's `workflow_dispatch`-only until `EXPO_TOKEN`, `MAESTRO_TEST_EMAIL`, and
`MAESTRO_TEST_PASSWORD` repo secrets are set up against a real staging backend.

### Health data

`useHealthSync` reads Apple HealthKit samples (steps, workouts, heart rate) on iOS via
`expo-health-kit`. It requires a development build (not Expo Go) and the
`expo-health-kit` config plugin already declared in `app.config.ts`.

## Web (admin)

Next.js app for internal/admin use (managing exercises, subscriptions, etc.).

```bash
cd apps/web
npm install
npm run dev
```

## Subscriptions

Subscription/entitlement resolution lives directly in the backend (`app/models/subscription.py`,
`app/services/subscription_service.py`) — no separate service to run.

Set in `backend/.env`:

| Variable | Default |
| --- | --- |
| `REVENUECAT_WEBHOOK_SECRET` | (none — required for the webhook route to accept requests) |

Endpoints (under `API_V1_PREFIX`, e.g. `/api/v1`):

- `GET  /entitlements/me` — current user's subscription/entitlement
- `POST /subscriptions/purchase` — upgrade to Pro (30-day period)
- `POST /subscriptions/cancel` — mark subscription cancelled
- `POST /webhooks/revenuecat` — RevenueCat webhook (initial purchase/renewal/cancellation/expiration), HMAC-SHA256 verified via `X-RevenueCat-Signature`

Pro-gated routes on the backend use the `RequiresPro` dependency (returns HTTP `402` for
free users), e.g. `GET /api/v1/analytics/summary`. The RevenueCat SDK fires webhooks for real
store purchases; the `POST /api/v1/subscriptions/purchase|cancel` routes let the app
apply/reflect changes immediately.

## Daily workout plans

The app suggests a free 5-day training split (Hevy's Bro Split — Chest / Back / Shoulders &
Traps / Legs & Abs / Arms, Monday–Friday, with the weekend as rest) through the backend:

- `GET /api/v1/plans/daily?offset=0` — today's plan (offset 0–6 shifts days)
- `GET /api/v1/plans/week` — all seven days

The plan data lives in `backend/app/services/workout_plan_service.py` as plain
structured data, so it is trivial to customize or replace. It is surfaced in the mobile app on
the **Exercise** screen.

Source: [Hevy's free 5-Day Bro Split guide](https://www.hevyapp.com/bro-split-workout-program-guide/).

## Personalized workout plan engine

A separate, database-backed system for generating a plan tailored to each user (as opposed to
the static Hevy split above). Plans (the prescription) and logs (what actually happened) are
kept as distinct tables so progressive-overload history can be computed from real logged sets.

- **Exercise library**: `exercises` table, seeded from a curated set of 76 bodyweight/dumbbell/
  barbell/machine/cable movements (a starting set, not exhaustive - grow it over time) tagged
  with a `muscle_group`, `secondary_muscle_groups`, a `movement_role` (compound/isolation),
  and a `video_url` placeholder to fill in with licensed demo clips later.
  `alternative_exercise_id` isn't in the source data - it's auto-computed at seed time,
  pairing each exercise with another in the same muscle group on different (ideally
  bodyweight) equipment. Seed/refresh with:
  ```bash
  cd backend && python -m app.seed
  ```
- **Split algorithm** (`app/services/plan_generator.py`): a fixed lookup table, no ML and no
  branching on experience level (that's a v2 concern) — more available days means more
  muscle-group specialization, fewer days means more full-body coverage per session:
  | Days | Split | Days |
  |---|---|---|
  | 1 | Full Body | Full Body |
  | 2 | Full Body ×2 | Full Body A, Full Body B |
  | 3 | Full Body ×3 | Full Body A/B/C |
  | 4 | Upper/Lower ×2 | Upper A, Lower A, Upper B, Lower B |
  | 5 | Push/Pull/Legs + Upper/Lower | Push, Pull, Legs, Upper, Lower |

  Each day type maps to a fixed exercise "slot" list (e.g. Full Body = quads, hamstrings,
  chest, back, shoulders, core = 6 exercises; Push = chest×2, shoulders, triceps×2 = 5).
  Slots are filled from the exercise library, filtered by the user's `available_equipment`
  and capped at their `experience_level` (set via `PATCH /api/v1/users/me`), preferring
  compound movements first and varying exercise choice across repeated day types (so
  Full Body A/B/C aren't identical).
- **Endpoints**:
  - `POST /api/v1/workout-plans/generate {days_per_week: 1-5}` — archives any existing active
    plan and generates a new one
  - `GET /api/v1/workout-plans/active` — the current plan with all days/exercises
  - `POST /api/v1/workout-logs/` — log a completed/partial session (actual weights/reps)
  - `GET /api/v1/workout-logs/` — a user's logged history

The mobile app is not yet wired to this engine (it still shows the static Hevy split on the
Exercise screen) — that's the next step if you want it surfaced in the UI.

## API contracts

`shared/types/api-contracts.ts` is hand-written; `shared/types/api-contracts.generated.ts` is
generated from the backend's live OpenAPI schema and kept in sync automatically by CI
(`.github/workflows/api-contracts-sync.yml`), which regenerates it on every backend change and
either fails the PR (if out of date) or auto-commits the update on `main`. To regenerate locally:

```bash
./shared/scripts/generate-api-contracts.sh
```

## Observability

The backend exports OpenTelemetry traces (OTLP/gRPC) and Prometheus metrics.

- Backend: `/metrics` (Prometheus), traces gated behind `OTEL_ENABLED=true` +
  `OTEL_EXPORTER_OTLP_ENDPOINT` (off by default so `pytest`/local dev without Docker doesn't
  need a collector running).

`docker compose up` starts Jaeger (`localhost:16686`), Prometheus (`localhost:9090`), and
Grafana (`localhost:3000`, anonymous viewer access, Prometheus + Jaeger datasources
pre-provisioned via `observability/grafana/provisioning`) alongside the app services, with
`OTEL_ENABLED=true` already set for the backend.

## CI/CD

CI (`backend-ci.yml`, `mobile-ci.yml`, `web-ci.yml`) runs lint/typecheck/tests on every push and
PR touching each service.

CD (`cd-backend.yml`, `cd-web.yml`) builds and pushes a Docker image to
GitHub Container Registry (`ghcr.io/<repo>/<service>`) on every push to `main` — this works out
of the box with the built-in `GITHUB_TOKEN`, no extra secrets needed. The final "Deploy" step in
each is a placeholder (`echo "TODO: deploy..."`) since there's no target infrastructure yet —
swap it for a `kubectl set image`, a Render/Fly/ECS deploy hook, etc. once one exists.

`cd-mobile.yml` builds (and optionally submits) the mobile app via EAS; it's manually triggered
(`workflow_dispatch`) and needs an `EXPO_TOKEN` repo secret.

## Security scanning

- **Dependabot** (`.github/dependabot.yml`) opens PRs for outdated/vulnerable dependencies
  across pip, npm (mobile + web), Docker base images, and GitHub Actions.
- **CodeQL** (`.github/workflows/codeql.yml`) runs static analysis (SAST) across Python and
  JS/TS on every push/PR and weekly, results in the repo's Security tab.
- **Trivy** (`.github/workflows/trivy.yml`) scans dependency manifests for known CVEs on every
  push/PR and weekly, also reporting into the Security tab.

None of these need an external account/token — they run entirely on GitHub's own
infrastructure. (A SonarQube/Snyk integration would add deeper code-quality/license checks but
needs its own account and token, so it's left out for now.)

## Full stack with Docker

```bash
docker compose up
```