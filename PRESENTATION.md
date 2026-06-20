# Call Quality Review Tool — System Overview

## What It Does

A supervisor tool that ingests a call transcript JSON, automatically detects key moments, scores the agent, generates AI coaching notes, and presents everything in a reviewable UI — in under 2 seconds, with no manual listening required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS |
| Backend | Node.js + Express 5 + TypeScript |
| Validation | Zod (frontend + backend, same schema) |
| AI / Coaching | Groq API — `llama-3.3-70b-versatile` |
| Storage | In-memory Map (swap-ready — single file change for DB) |
| Deployment | Docker multi-stage → Render (tag-based CD via GitHub Actions) |
| Testing | Vitest + Supertest — 23 tests |

---

## API Endpoints

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/calls` | Ingest a transcript → runs full pipeline |
| `GET` | `/api/calls` | List all calls (optional `?agent=` filter) |
| `GET` | `/api/calls/:id` | Full call detail with annotated transcript |
| `GET` | `/api/calls/:id/moments` | Moments array for a call |

---

## Ingest Pipeline (POST /api/calls)

When a transcript is POSTed, five steps run in sequence:

```
JSON Input
    │
    ▼
1. Zod Validation (frontend + backend)
    │
    ▼
2. detectMoments(turns)            ← pure, deterministic, no LLM
    │
    ▼
3. generateSummary(turns, moments) ← pure math
    │
    ▼
4. generateCoachingNotes(...)      ← Groq LLM (llama-3.3-70b-versatile)
    │
    ▼
5. Store in memory → return { callId, momentCount }
```

---

## Step 2 — detectMoments() Calculations

Scans every turn linearly. Four rules evaluated independently per turn.

### Rule 1 — Escalation Signal (customer turns only)

**Trigger:** customer text contains any of: `cancel`, `refund`, `manager`, `lawsuit`

```
lower = turn.text.toLowerCase()
if speaker === "customer" AND lower.includes(keyword) → escalation_signal
```

### Rule 2 — Empathy Statement (agent turns only)

**Trigger:** agent text contains any of: `i understand`, `i'm sorry`, `i apologise`, `i apologize`

```
if speaker === "agent" AND lower.includes(phrase) → empathy_statement
```

### Rule 3 — Dead Air (between consecutive turns)

**Trigger:** gap between current turn and previous turn timestamp > 15 seconds

```
gap = turn.t - turns[i - 1].t
if gap > 15 → dead_air  (tagged as speaker: "system")
```

### Rule 4 — Long Monologue (any speaker)

**Trigger:** word count of a single turn > 50 words

```
wordCount = turn.text.trim().split(/\s+/).length
if wordCount > 50 → long_monologue
```

Each detected moment records: `{ type, t (timestamp), speaker, matchedText }`

---

## Step 3 — generateSummary() Calculations

### Talk Ratio

Counts turns per speaker (turn-based, not word-based):

```
talkRatio.agent    = round(agentTurns / totalTurns × 100)
talkRatio.customer = round(customerTurns / totalTurns × 100)
```

### Empathy Score

Measures how well the agent responded to customer escalations:

```
empathyScore = empathyStatements / escalationSignals  → capped at 1.0

if escalationSignals === 0 → empathyScore = 1.0 (no escalations = perfect)
```

**Examples:**

| Escalations | Empathy responses | Score |
|---|---|---|
| 3 | 3 | 1.0 (100%) |
| 3 | 1 | 0.33 (33%) |
| 0 | any | 1.0 (100%) |

### Sentiment Arc

Splits the call at the midpoint turn and checks where escalations cluster:

```
midpoint     = turns[floor(turns.length / 2)].t

inFirstHalf  = any escalation with t < midpoint
inSecondHalf = any escalation with t >= midpoint

"improved" → escalations only in first half  (customer calmed down)
"declined" → escalations only in second half (call got worse)
"neutral"  → escalations in both halves OR no escalations at all
```

---

## Step 4 — generateCoachingNotes() (Groq LLM)

Sends the full transcript and all detected moments to `llama-3.3-70b-versatile` with a prompt requesting exactly 3 bullet points of actionable, agent-specific coaching.

**Fallback if Groq is unavailable:** deterministic bullets are generated from the moment types found (escalation → de-escalation tip, dead air → narration tip, etc.). The ingest never fails because of an AI outage.

---

## Validation — Four Layers

```
User pastes JSON in dialog
        │
        ▼
Layer 1: JSON.parse() — syntax check (client)
  ✗ → "Invalid JSON — check for missing brackets or commas"
  ✓ → continue (no API call yet)
        │
        ▼
Layer 2: Zod schema — structure check (client)
  ✗ missing callId         → "callId: callId is required"
  ✗ zero/negative duration → "duration must be a positive number"
  ✗ empty turns array      → "turns must have at least one entry"
  ✗ invalid speaker        → 'speaker must be "agent" or "customer"'
  ✓ → API call made
        │
        ▼
Layer 3: Zod schema — same rules enforced again (backend)
  Guards against direct API abuse, returns 400 + human-readable field message
        │
        ▼
Layer 4: Business logic (backend)
  ✗ duplicate callId → 409 "Call ID already exists"
  ✗ unknown callId   → 404 "Call not found"
  ✓ → pipeline runs
```

---

## Test Coverage — 23 Tests (Vitest + Supertest)

| Area | Cases covered |
|---|---|
| Happy path | 201 response, momentCount returned, escalation detected |
| 409 Duplicate | "Call ID already exists" |
| 400 Field errors | missing callId, agentName, turns; empty strings; zero/negative duration; invalid speaker; negative timestamp; empty body |
| 404 Not found | GET `/calls/:id` and GET `/calls/:id/moments` |
| GET /calls | empty list, call appears after ingest, agent filter match, agent filter no-match |
| Health check | `/health` → `{ status: "ok" }` |

Groq is mocked as a class — no real API calls during test runs. Store is cleared before each test for full isolation.

Run locally:
```bash
cd backend && npm test
```

Run in Docker (shows in Docker Desktop logs):
```bash
docker compose up --build
```

---

## Deployment

### Docker — Multi-Stage Build

```
Stage 1: frontend-builder   npm ci + vite build  → /frontend/dist
Stage 2: backend-builder    npm ci + tsc          → /dist
Stage 3: test-runner        npm ci + vitest run   → exits after tests pass
Stage 4: production         node dist/index.js    → serves UI + API on :3000
```

Express detects `NODE_ENV=production` and serves the Vite build as static files — single service, no CORS, no separate frontend host.

### Render — Tag-Based CD

```
git tag v1.x.x
git push origin v1.x.x
      │
      ▼
GitHub Actions (.github/workflows/deploy.yml)
      │  triggered on v* tags
      ▼
curl RENDER_DEPLOY_WEBHOOK
      │
      ▼
Render pulls image → deploys → live in ~3 min
```

**Live URL:** https://observe-ai-fullstack-app.onrender.com

---

## Input Format (sample-call.json)

```json
{
  "callId": "C001",
  "agentName": "Priya Sharma",
  "duration": 312,
  "turns": [
    { "speaker": "agent",    "text": "Thank you for calling...", "t": 0   },
    { "speaker": "customer", "text": "I need a refund...",       "t": 6   },
    { "speaker": "agent",    "text": "I completely understand...", "t": 14 }
  ]
}
```

| Field | Type | Rule |
|---|---|---|
| `callId` | string | unique, non-empty |
| `agentName` | string | non-empty |
| `duration` | number | positive (seconds) |
| `turns[].speaker` | `"agent"` \| `"customer"` | strict enum |
| `turns[].text` | string | non-empty |
| `turns[].t` | number | ≥ 0 (seconds from call start) |
