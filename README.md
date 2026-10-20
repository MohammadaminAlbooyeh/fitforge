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

## Web

Next.js app that mirrors the mobile app's user-facing features (home, plan, nutrition,
progress, social, achievements) plus an `/admin` section for managing exercises and
subscriptions.

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
- **Split algorithm** (`app/services/plan_generator.py`): a fixed lookup table, no ML — more
  available days means more muscle-group specialization, fewer days means more full-body
  coverage per session. `experience_level` now also picks between split *variants* at 3 and 5
  days (not just the exercise difficulty tier, see below): beginner/intermediate users get the
  full-body/upper-lower progression, advanced users get a Push/Pull/Legs-based split:
  | Days | Beginner/Intermediate | Advanced |
  |---|---|---|
  | 1 | Full Body | Full Body |
  | 2 | Full Body ×2 (A, B) | Full Body ×2 (A, B) |
  | 3 | Full Body ×3 (A/B/C) | Push, Pull, Legs |
  | 4 | Upper/Lower ×2 (Upper A, Lower A, Upper B, Lower B) | Upper/Lower ×2 (same) |
  | 5 | Upper/Lower ×2.5 (Upper A, Lower A, Upper B, Lower B, Upper C) | Push, Pull, Legs, Upper, Lower |

  Each day type maps to a fixed exercise "slot" list (e.g. Full Body = quads, hamstrings,
  glutes, chest, back, shoulders, core = 7 exercises; Push = chest×2, shoulders, triceps×2 = 5).
  Slots are filled from the exercise library, filtered by the user's `available_equipment`
  and capped at their `experience_level` (set via `PATCH /api/v1/users/me`), preferring
  compound movements first and varying exercise choice across repeated day types (so
  Full Body A/B/C aren't identical).
- **Endpoints**:
  - `POST /api/v1/workout-plans/generate {days_per_week: 1-5}` — archives any existing active
    plan and generates a new one
  - `GET /api/v1/workout-plans/active` — the current plan with all days/exercises
  - `POST /api/v1/workout-logs/` — log a completed/partial session (actual weights/reps). Accepts
    an optional `client_id` (e.g. a UUID the mobile app generates when logging offline) — 
    resubmitting the same `client_id` after reconnecting returns the original log instead of
    creating a duplicate, so a queued-offline-log sync is safe to retry.
  - `GET /api/v1/workout-logs/` — a user's logged history
  - `GET /api/v1/workout-logs/next-set-suggestion/{exercise_id}` — rest-timer prompt: sets/reps/
    rest and an advisory target weight for the *next* set of that exercise, using the same
    progressive-overload logic as plan generation (`plan_generator.suggest_next_set`), but
    callable any time — not just at plan (re)generation. Surfaced on both web (plan page) and
    mobile (`DailyPlanScreen`) as a "Suggested" line per exercise.
  - `PATCH /api/v1/workout-plans/plan-day-exercises/{id}` — edit a single exercise's sets/reps
    on the active plan.

The mobile app is wired to this engine: the home feed, schedule, and plan screens fetch from
`/workout-plans/active` instead of the static Hevy split.

## Adaptive plan adjustment (Pro)

`POST /api/v1/workout-plans/adaptive-adjust` (Pro-gated via `RequiresPro`) nudges the *active*
plan based on recent training load instead of waiting for the next full regenerate:

- Computes a recovery score from the last 4 weeks of logged set volume
  (`analytics_service.get_recovery_insight`).
- If fatigue is high (recovery score ≤ 40), trims one set (never below 2) off every
  `PlanDayExercise` in days that haven't been logged yet this cycle — an automatic deload.
  Days already logged this cycle are left untouched.
- Otherwise it's a no-op; day-to-day progressive overload already happens at plan-generation
  time (see above).

Returns the updated plan plus a list of what changed and why
(`app/schemas/workout_plan_db.AdaptiveAdjustResult`). Logic lives in
`app/services/plan_generator.adaptive_adjust_plan`. Exposed as an "Adjust plan" action on both
web and mobile; non-Pro users are routed to the paywall instead of the request going through.

## Social & gamification

Follow other users, compare progress on a leaderboard, run challenges, and earn XP/achievements
(`app/api/v1/social.py`, `app/api/v1/achievements.py`, `app/services/social_service.py`):

- `POST/DELETE /api/v1/social/follow[/{user_id}]`, `GET /api/v1/social/followers|following`,
  `GET /api/v1/social/search?q=` — follow graph and user lookup
- `GET /api/v1/social/profile/{user_id}` — a followed/searched user's public profile
- `POST /api/v1/social/challenges`, `POST /api/v1/social/challenges/{id}/join`,
  `GET /api/v1/social/challenges[/{id}]` — create/join/list community challenges
- `GET /api/v1/social/leaderboard`, `GET /api/v1/social/feed` — XP ranking and a feed of recent
  workouts from people you follow
- `GET /api/v1/gamification/summary` — current XP/level, progress to next level, and unlocked
  achievements

Both mobile (`SocialFeedScreen`, `AchievementsScreen`) and web (`/social`, `/achievements`) have
full UI for this now — feed, leaderboard, challenges (with join), user search/follow, and an
achievements grid.

## Nutrition goals

`NutritionLog`/`WaterLog` (`app/models/nutrition.py`, `app/models/water.py`) already cover manual
food/water logging; `NutritionGoal` adds per-user daily targets:

- `PUT /api/v1/nutrition/goal` — set/update daily calorie and macro targets (any field optional)
- `GET /api/v1/nutrition/goal` — read the current targets (404 if none set)
- `GET /api/v1/nutrition/day?day=YYYY-MM-DD` — daily summary now includes `goal_*` and
  `remaining_*` fields (calories/protein/carbs/fat) whenever a goal is set, so the mobile app can
  render a "X kcal remaining" style progress bar without computing it client-side.

Both web (`/nutrition`) and mobile (`NutritionLogScreen`) let users set/edit their goal and
edit or delete individual logged entries, not just add new ones. Body measurements
(`/api/v1/body-measurements/{id}` PATCH/DELETE) already had edit/delete UI on both platforms.

## Offline mode

The mobile app queues workout logs when there's no connectivity instead of losing them:
`src/api/workoutLogs.ts` `createWorkoutLog` catches network-level failures (no HTTP response at
all — as opposed to a server-side rejection), persists the log to an `AsyncStorage`-backed queue
(`src/utils/offlineQueue.ts`) stamped with a generated `client_id`, and returns a `queuedOffline`
flag so the UI (`DailyPlanScreen`) can tell the user it was saved locally instead of showing an
error. `src/utils/offlineSync.ts` watches connectivity via `@react-native-community/netinfo` and
flushes the queue automatically once the device is back online, retrying each entry against
`POST /api/v1/workout-logs/`. That retry is safe to replay because the backend treats
`client_id` as an idempotency key (see above) — resubmitting the same `client_id` after
reconnecting returns the original log instead of creating a duplicate.

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
of the box with the built-in `GITHUB_TOKEN`, no extra secrets needed. The final "Deploy" step
triggers a deploy hook (`${{ secrets.DEPLOY_HOOK_URL }}`) if configured — add a Render/Fly/ECS
deploy hook URL as a repo secret and it will receive the new image tag to pull.

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