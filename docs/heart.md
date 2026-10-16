# HEART: goals, signals, and metrics

HEART is Google's user-centered framework: **Happiness, Engagement, Adoption, Retention, and Task success**. We adapt it to a personal planner, using a goals → signals → metrics mapping rather than a single opaque productivity score. [Original paper](https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/).

| Dimension | Goal | Signal | Metric in this app |
| --- | --- | --- | --- |
| Happiness | Planning feels manageable | Optional daily response: “How clear does your plan feel?” | Mean clarity rating (1–5), response count, prior-period mean |
| Engagement | The planner supports meaningful work | Task creation/completion and focus starts | Distinct active local dates in the current seven-day window |
| Adoption | Reach the first useful moment | First recorded task and first focus session | Milestone timestamps since measurement began |
| Retention | Return to a useful workflow | Activity in both adjacent seven-day windows | Personal return indicator; unknown if there was no previous activity |
| Task success | Follow through on intended focus | Focus sessions started and finished | Completed sessions / sessions started in the window, with raw counts |

These are personal signals. A clarity rating is a proxy for the Happiness dimension, not a clinical measure or a validated satisfaction scale. Adoption and retention are individual milestones/indicators, not product-wide acquisition or cohort retention rates. Task completion counts include completion transitions, so reopening and completing a task again adds another transition.

## Recording and time windows

Apply `server/migrations/001_heart_activity.sql` to the existing database before using activity features. It adds `todo.completed_at`, task-change triggers, `activity_events`, `focus_sessions`, and `clarity_checkins`. Task events are inserted in the same transaction as task changes. Historical task activity is not backfilled or invented.

The backend requires a **server-only Supabase service_role key** for these tables. Browser/database roles have no direct grants; FastAPI authenticates the existing custom application JWT, derives the user ID, and scopes every query to that user. Do not expose the service key through a `NEXT_PUBLIC_` variable. This migration does not replace or repair the project's existing user/task table policies.

Metrics use the selected IANA timezone and seven local dates including today, compared with the preceding seven local dates. Today is partial. DST can change the number of hours in a window; local dates remain distinct. Focus statistics belong to the session's **start-date cohort**. Running sessions count as starts but do not add completed minutes, so their completion rate is provisional. Finished and ended-early sessions contribute recorded minutes.

Focus starts use client-generated UUIDs for retry safety. A finish must match the authenticated owner and cannot exceed the planned or wall-clock elapsed duration. Finishing early is recorded as ended early rather than completion. Repeated finish requests cannot rewrite a closed session. The timer records user interaction, not proof that a person remained attentive.

Check-ins are optional and replace the same user's previous response for that local date. No task titles, notes, or passive browsing histories are collected in the activity tables. Empty clarity, retention, and completion-rate values remain null rather than becoming misleading zeros.

## Endpoints

- `GET /api/insights/summary?timezone=America/Toronto`
- `POST /api/insights/checkins` with `score` and `timezone`
- `POST /api/insights/focus` with a UUID `id` and `planned_seconds`
- `PATCH /api/insights/focus/{id}` with `status` (`completed` or `abandoned`) and `actual_seconds`
- `PATCH /api/todo/{id}/completion` with `completed` (boolean)

The server calculates all metrics. AI reflections receive computed evidence, not authority to calculate or change the underlying numbers. Measurements describe app activity and self-reported clarity; they do not establish improvements in mental health, learning, or real-world productivity.
