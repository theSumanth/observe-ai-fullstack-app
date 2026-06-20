import { Turn, Moment, Summary } from "../types";

export function generateSummary(turns: Turn[], moments: Moment[]): Summary {
  const total = turns.length;
  const agentTurns = turns.filter((t) => t.speaker === "agent").length;
  const customerTurns = total - agentTurns;

  const talkRatio =
    total === 0
      ? { agent: 0, customer: 0 }
      : {
          agent: Math.round((agentTurns / total) * 100),
          customer: Math.round((customerTurns / total) * 100),
        };

  const escalationSignals = moments.filter(
    (m) => m.type === "escalation_signal"
  ).length;
  const empathyStatements = moments.filter(
    (m) => m.type === "empathy_statement"
  ).length;

  const empathyScore =
    escalationSignals === 0
      ? 1.0
      : Math.min(empathyStatements / escalationSignals, 1.0);

  const sentimentArc = computeSentimentArc(turns, moments);

  return { talkRatio, escalationCount: escalationSignals, empathyScore, sentimentArc };
}

function computeSentimentArc(turns: Turn[], moments: Moment[]): Summary["sentimentArc"] {
  if (turns.length === 0) return "neutral";

  const midpoint = turns[Math.floor(turns.length / 2)].t;
  const escalations = moments.filter((m) => m.type === "escalation_signal");

  const inFirstHalf = escalations.some((m) => m.t < midpoint);
  const inSecondHalf = escalations.some((m) => m.t >= midpoint);

  if (inFirstHalf && !inSecondHalf) return "improved";
  if (!inFirstHalf && inSecondHalf) return "declined";
  return "neutral";
}
