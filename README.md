# Call Quality Review Tool

An internal tool for contact center supervisors to review call transcripts, automatically detect key moments, score agent performance, and generate AI coaching notes — without listening to a single recording.

Built for the **Observe.AI Fullstack Engineer Hackathon**.

**Live:** https://observe-ai-fullstack-app.onrender.com

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the Pipeline Works](#how-the-pipeline-works)
- [Moment Detection Logic](#moment-detection-logic)
- [Summary Calculations](#summary-calculations)
- [Validation Layers](#validation-layers)
- [Testing](#testing)
- [Docker](#docker)
- [Deployment](#deployment)

---

## Overview

Supervisors paste or POST a call transcript JSON. The system runs a 4-step pipeline — moment detection, summary scoring, AI coaching, storage — and returns an annotated, interactive call review in under 2 seconds.

**Features:**
- Detect 4 moment types: escalation signals, empathy statements, dead air, long monologues
- Score empathy, talk ratio, and sentiment arc per call
- AI coaching notes via Groq (llama-3.3-70b-versatile) with deterministic fallback
- Filter calls by agent name, drill into any call, view annotated transcript
- Full client-side + server-side Zod validation with human-readable errors
- 23 integration tests (Vitest + Supertest)
- Tag-based CD to Render via GitHub Actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, shadcn/ui, Tailwind CSS v4 |
| Backend | Node.js, Express 5, TypeScript |
| Validation | Zod v4 (frontend + backend) |
| Data Fetching | TanStack Query v5 |
| Routing | React Router v6 |
| HTTP Client | Axios (with response interceptor for error extraction) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Storage | In-memory Map (single file swap for any DB) |
| Testing | Vitest, Supertest |
| Containers | Docker multi-stage, docker-compose |
| CD | GitHub Actions → Render webhook |

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app factory (no listen — testable)
│   │   ├── index.ts                # Entry point — validates env, starts server
│   │   ├── routes/index.ts         # Registers all routers
│   │   ├── controllers/
│   │   │   └── calls.controller.ts
│   │   ├── services/
│   │   │   ├── calls.service.ts    # Orchestrates pipeline
│   │   │   ├── moments.service.ts  # detectMoments() — pure, deterministic
│   │   │   ├── summary.service.ts  # generateSummary() — pure math
│   │   │   └── coaching.service.ts # generateCoachingNotes() — Groq LLM
│   │   ├── storage/
│   │   │   └── calls.store.ts      # In-memory Map with save/find/clear
│   │   ├── middleware/
│   │   │   └── errorHandler.ts     # ZodError → 400, Error.status → N, else 500
│   │   ├── types/index.ts          # Zod schemas + inferred TS types
│   │   └── tests/
│   │       └── calls.test.ts       # 23 integration tests
│   ├── vitest.config.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance + response interceptor
│   │   │   └── calls.api.ts        # Typed API functions
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui (auto-generated)
│   │   │   ├── ObserveAILogo.tsx
│   │   │   ├── TranscriptView.tsx
│   │   │   ├── SummaryPanel.tsx
│   │   │   ├── MomentsSidebar.tsx
│   │   │   └── MomentBadge.tsx
│   │   ├── hooks/
│   │   │   └── useCalls.ts         # TanStack Query wrappers
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── CallListPage.tsx    # Dashboard with ingest dialog
│   │   │   └── CallDetailPage.tsx  # Annotated transcript + summary + moments
│   │   ├── types/index.ts
│   │   ├── App.tsx                 # Routes: / → /dashboard → /calls/:id
│   │   └── main.tsx
│   └── package.json
│
├── Dockerfile                      # 4-stage: frontend / backend / test / production
├── docker-compose.yml              # app (port 8080) + tests services
├── .github/workflows/deploy.yml    # Tag-based CD
├── sample-call.json                # Ready-to-paste test transcript
└── PRESENTATION.md                 # Pipeline + calculations reference
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for containerised run)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### Local Development

```bash
# 1. Clone
git clone https://github.com/theSumanth/observe-ai-fullstack-app.git
cd observe-ai-fullstack-app

# 2. Backend
cd backend
cp .env.example .env          # fill in GROQ_API_KEY
npm install
npm run dev                   # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:3000` so there are no CORS issues in dev.

### Docker (full stack + tests)

```bash
# Create root .env with your key
echo "GROQ_API_KEY=gsk_..." > .env

docker compose up --build
```

- **App** → http://localhost:8080
- **Tests** → runs 23 tests and exits (visible in Docker Desktop logs)

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for coaching notes |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` / `production` / `test` |

### Root (`.env` — for docker-compose only)

```env
GROQ_API_KEY=gsk_...
```

---

## API Reference

### POST `/api/calls`

Ingest a call transcript. Runs the full pipeline and stores the result.

**Request body:**
```json
{
  "callId": "C001",
  "agentName": "Priya Sharma",
  "duration": 312,
  "turns": [
    { "speaker": "agent",    "text": "Thank you for calling...", "t": 0  },
    { "speaker": "customer", "text": "I need a refund...",       "t": 6  }
  ]
}
```

| Field | Type | Constraint |
|---|---|---|
| `callId` | string | unique, non-empty |
| `agentName` | string | non-empty |
| `duration` | number | positive (seconds) |
| `turns[].speaker` | `"agent"` \| `"customer"` | strict enum |
| `turns[].text` | string | non-empty |
| `turns[].t` | number | ≥ 0 (seconds from call start) |

**Responses:**

| Status | Meaning |
|---|---|
| 201 | `{ callId, momentCount }` |
| 400 | Validation error — field-level message e.g. `"turns: turns must have at least one entry"` |
| 409 | `"Call ID already exists"` |

---

### GET `/api/calls`

List all ingested calls. Optional agent filter.

```
GET /api/calls
GET /api/calls?agent=Priya
```

**Response:** `200` — array of `CallListItem`

```json
[
  {
    "callId": "C001",
    "agentName": "Priya Sharma",
    "duration": 312,
    "momentCount": 5,
    "empathyScore": 0.67,
    "sentimentArc": "improved"
  }
]
```

---

### GET `/api/calls/:id`

Full call detail — annotated transcript, summary, coaching notes.

**Response:** `200` — `CallDetail`

```json
{
  "callId": "C001",
  "agentName": "Priya Sharma",
  "duration": 312,
  "turns": [
    {
      "speaker": "agent",
      "text": "...",
      "t": 0,
      "moments": [{ "type": "empathy_statement", "t": 0, "speaker": "agent", "matchedText": "i understand" }]
    }
  ],
  "summary": {
    "talkRatio": { "agent": 55, "customer": 45 },
    "escalationCount": 3,
    "empathyScore": 0.67,
    "sentimentArc": "improved"
  },
  "coachingNotes": ["• De-escalate early...", "• Narrate actions during hold...", "• ..."]
}
```

**Errors:** `404` — `"Call not found"`

---

### GET `/api/calls/:id/moments`

Raw moments array for a call.

**Response:** `200` — `{ moments: Moment[] }`

**Errors:** `404` — `"Call not found"`

---

## How the Pipeline Works

```
POST /api/calls
      │
      ▼
1. Zod validates request body
      │
      ▼
2. detectMoments(turns)
   Scans every turn → returns Moment[]
      │
      ▼
3. generateSummary(turns, moments)
   Computes talkRatio, empathyScore, sentimentArc
      │
      ▼
4. generateCoachingNotes(agentName, turns, moments)
   Calls Groq → 3 bullet points
   Falls back to deterministic notes if Groq is unavailable
      │
      ▼
5. callsStore.save(call)
      │
      ▼
6. Return { callId, momentCount }
```

---

## Moment Detection Logic

### Escalation Signal — customer turns only
Fires when the customer's text contains any of:
`cancel` · `refund` · `manager` · `lawsuit`

### Empathy Statement — agent turns only
Fires when the agent's text contains any of:
`i understand` · `i'm sorry` · `i apologise` · `i apologize`

### Dead Air — between consecutive turns
Fires when the gap between two adjacent turns exceeds **15 seconds**.
```
gap = turn.t - turns[i - 1].t
if gap > 15 → dead_air
```

### Long Monologue — any speaker
Fires when a single turn exceeds **50 words**.
```
wordCount = turn.text.trim().split(/\s+/).length
if wordCount > 50 → long_monologue
```

---

## Summary Calculations

### Talk Ratio
Turn-count based (not word count):
```
agent    = round(agentTurns / totalTurns × 100)
customer = round(customerTurns / totalTurns × 100)
```

### Empathy Score
Ratio of empathy responses to escalation signals, capped at 1.0:
```
score = empathyStatements / escalationSignals   (max 1.0)
      = 1.0 if no escalations detected
```

### Sentiment Arc
Splits the call at the midpoint turn timestamp:
```
midpoint = turns[floor(n / 2)].t

"improved" → escalations only in first half
"declined" → escalations only in second half
"neutral"  → escalations in both halves, or none at all
```

---

## Validation Layers

```
UI dialog
  Layer 1 — JSON.parse()         syntax errors caught client-side
  Layer 2 — Zod (frontend)       structural errors caught client-side, no API call

API
  Layer 3 — Zod (backend)        guards direct API access, returns 400 + field message
  Layer 4 — Business logic       409 duplicate / 404 not found
```

All errors surface as human-readable toast messages — no raw HTTP status codes shown to users.

---

## Testing

```bash
cd backend
npm test          # run once
npm run test:watch  # watch mode
```

**23 tests across:**

| Suite | Tests |
|---|---|
| POST happy path | 201 response, moment detection |
| POST 409 | duplicate callId |
| POST 400 | missing callId, agentName, turns; empty values; bad duration; invalid speaker; negative timestamp; empty body |
| GET /calls | empty list, populated list, agent filter match, agent filter no-match |
| GET /calls/:id | full detail returned, 404 for unknown id |
| GET /calls/:id/moments | array returned, 404 for unknown id |
| Health | /health → `{ status: "ok" }` |

Groq is mocked as a class — no real API calls during tests. Store is cleared between each test.

---

## Docker

### Services

```yaml
app    # production image — Express serves React on port 8080
tests  # test-runner — runs vitest, prints results, exits
```

### Commands

```bash
docker compose up --build        # start app + run tests
docker compose up app            # app only
docker compose run --rm tests    # tests only
```

### Multi-Stage Dockerfile

| Stage | What it does |
|---|---|
| `frontend-builder` | `npm ci` + `vite build` |
| `backend-builder` | `npm ci` + `tsc` |
| `test-runner` | `npm ci` (with devDeps) + `vitest run` |
| `production` | copies both build outputs, runs `node dist/index.js` |

In production, Express serves the Vite build as static files — single service, no separate frontend host, no CORS.

---

## Deployment

Tag-based continuous deployment via GitHub Actions:

```bash
git tag v1.x.x
git push origin v1.x.x
```

GitHub Actions (`.github/workflows/deploy.yml`) triggers on `v*` tags and curls the `RENDER_DEPLOY_WEBHOOK` secret → Render pulls and deploys the latest image.

**Render settings:**
- Environment: Docker
- Root Directory: _(blank — Dockerfile is at repo root)_
- `NODE_ENV=production`
- `GROQ_API_KEY=gsk_...`

---

## Sample Call

A ready-to-use transcript is included at `sample-call.json`. Paste its contents into the **Ingest Call** dialog on the dashboard, or POST it directly:

```bash
curl -X POST https://observe-ai-fullstack-app.onrender.com/api/calls \
  -H "Content-Type: application/json" \
  -d @sample-call.json
```

This call contains escalation signals (`refund`, `cancel`, `lawsuit`), empathy statements, a dead air gap, and a long agent monologue — demonstrating all four moment types.
