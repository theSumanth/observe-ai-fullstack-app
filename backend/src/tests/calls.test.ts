import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { callsStore } from "../storage/calls.store";

// Mock Groq so no real API calls are made during tests
vi.mock("groq-sdk", () => {
  class MockGroq {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "• Note 1\n• Note 2\n• Note 3" } }],
        }),
      },
    };
  }
  return { default: MockGroq };
});

const app = createApp();

const VALID_CALL = {
  callId: "TEST-001",
  agentName: "Alice Smith",
  duration: 120,
  turns: [
    { speaker: "agent", text: "Hello, how can I help?", t: 0 },
    { speaker: "customer", text: "I need to cancel my subscription.", t: 5 },
    { speaker: "agent", text: "I completely understand. Let me help you with that.", t: 12 },
  ],
};

beforeEach(() => {
  callsStore.clear();
});

// ─── POST /api/calls ──────────────────────────────────────────────────────────

describe("POST /api/calls — happy path", () => {
  it("returns 201 with callId and momentCount", async () => {
    const res = await request(app).post("/api/calls").send(VALID_CALL);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ callId: VALID_CALL.callId });
    expect(typeof res.body.momentCount).toBe("number");
  });

  it("detects escalation_signal on cancel keyword", async () => {
    const res = await request(app).post("/api/calls").send(VALID_CALL);
    expect(res.status).toBe(201);
    expect(res.body.momentCount).toBeGreaterThan(0);
  });
});

describe("POST /api/calls — 409 duplicate callId", () => {
  it("returns 409 with human-readable message on duplicate callId", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).post("/api/calls").send(VALID_CALL);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Call ID already exists");
  });
});

describe("POST /api/calls — 400 validation errors", () => {
  it("missing callId → 400 with field message", async () => {
    const { callId: _, ...body } = VALID_CALL;
    const res = await request(app).post("/api/calls").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/callId/i);
  });

  it("empty callId → 400", async () => {
    const res = await request(app).post("/api/calls").send({ ...VALID_CALL, callId: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/callId/i);
  });

  it("missing agentName → 400", async () => {
    const { agentName: _, ...body } = VALID_CALL;
    const res = await request(app).post("/api/calls").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/agentName/i);
  });

  it("zero duration → 400", async () => {
    const res = await request(app).post("/api/calls").send({ ...VALID_CALL, callId: "T-dur-0", duration: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duration/i);
  });

  it("negative duration → 400", async () => {
    const res = await request(app).post("/api/calls").send({ ...VALID_CALL, callId: "T-dur-neg", duration: -10 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/duration/i);
  });

  it("empty turns array → 400", async () => {
    const res = await request(app).post("/api/calls").send({ ...VALID_CALL, callId: "T-turns-empty", turns: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/turns/i);
  });

  it("missing turns field → 400", async () => {
    const { turns: _, ...body } = VALID_CALL;
    const res = await request(app).post("/api/calls").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/turns/i);
  });

  it("invalid speaker value → 400 with message", async () => {
    const res = await request(app).post("/api/calls").send({
      ...VALID_CALL,
      callId: "T-spk",
      turns: [{ speaker: "robot", text: "Hello", t: 0 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/speaker/i);
  });

  it("empty turn text → 400", async () => {
    const res = await request(app).post("/api/calls").send({
      ...VALID_CALL,
      callId: "T-txt",
      turns: [{ speaker: "agent", text: "", t: 0 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text/i);
  });

  it("negative timestamp → 400", async () => {
    const res = await request(app).post("/api/calls").send({
      ...VALID_CALL,
      callId: "T-ts",
      turns: [{ speaker: "agent", text: "Hello", t: -5 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/timestamp|t \(/i);
  });

  it("missing body entirely → 400", async () => {
    const res = await request(app).post("/api/calls").send({});
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/calls ───────────────────────────────────────────────────────────

describe("GET /api/calls", () => {
  it("returns empty array when no calls ingested", async () => {
    const res = await request(app).get("/api/calls");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns call in list after ingestion", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).get("/api/calls");
    expect(res.status).toBe(200);
    expect(res.body.some((c: { callId: string }) => c.callId === VALID_CALL.callId)).toBe(true);
  });

  it("filters by agent name", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).get("/api/calls?agent=Alice");
    expect(res.status).toBe(200);
    expect(res.body.every((c: { agentName: string }) => c.agentName.includes("Alice"))).toBe(true);
  });

  it("returns empty array when agent filter matches nobody", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).get("/api/calls?agent=nobody");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

// ─── GET /api/calls/:id ───────────────────────────────────────────────────────

describe("GET /api/calls/:id", () => {
  it("returns call detail after ingestion", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).get(`/api/calls/${VALID_CALL.callId}`);
    expect(res.status).toBe(200);
    expect(res.body.callId).toBe(VALID_CALL.callId);
    expect(res.body.agentName).toBe(VALID_CALL.agentName);
    expect(Array.isArray(res.body.turns)).toBe(true);
    expect(Array.isArray(res.body.coachingNotes)).toBe(true);
  });

  it("returns 404 with human-readable message for unknown callId", async () => {
    const res = await request(app).get("/api/calls/DOES-NOT-EXIST");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Call not found");
  });
});

// ─── GET /api/calls/:id/moments ───────────────────────────────────────────────

describe("GET /api/calls/:id/moments", () => {
  it("returns moments array after ingestion", async () => {
    await request(app).post("/api/calls").send(VALID_CALL);
    const res = await request(app).get(`/api/calls/${VALID_CALL.callId}/moments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.moments)).toBe(true);
  });

  it("returns 404 with human-readable message for unknown callId", async () => {
    const res = await request(app).get("/api/calls/DOES-NOT-EXIST/moments");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Call not found");
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
