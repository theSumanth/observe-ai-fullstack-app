import { IngestCallInput, AnnotatedTurn } from "../types";
import { detectMoments } from "./moments.service";
import { generateSummary } from "./summary.service";
import { generateCoachingNotes } from "./coaching.service";
import { callsStore } from "../storage/calls.store";

export async function ingestCall(input: IngestCallInput) {
  if (callsStore.exists(input.callId)) {
    throw Object.assign(new Error("Call ID already exists"), { status: 409 });
  }

  const moments = detectMoments(input.turns);
  const summary = generateSummary(input.turns, moments);
  const coachingNotes = await generateCoachingNotes(
    input.agentName,
    input.turns,
    moments
  );

  callsStore.save({
    callId: input.callId,
    agentName: input.agentName,
    duration: input.duration,
    turns: input.turns,
    moments,
    summary,
    coachingNotes,
  });

  return { callId: input.callId, momentCount: moments.length };
}

export function listCalls(agent?: string) {
  return callsStore.findAll(agent);
}

export function getCall(callId: string) {
  const call = callsStore.findById(callId);
  if (!call) throw Object.assign(new Error("Call not found"), { status: 404 });

  const annotatedTurns: AnnotatedTurn[] = call.turns.map((turn) => ({
    ...turn,
    moments: call.moments.filter((m) => m.t === turn.t && m.speaker !== "system"),
  }));

  return {
    callId: call.callId,
    agentName: call.agentName,
    duration: call.duration,
    turns: annotatedTurns,
    summary: call.summary,
    coachingNotes: call.coachingNotes,
  };
}

export function getCallMoments(callId: string) {
  const call = callsStore.findById(callId);
  if (!call) throw Object.assign(new Error("Call not found"), { status: 404 });
  return { moments: call.moments };
}
