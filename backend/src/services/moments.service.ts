import { Turn, Moment } from "../types";

const ESCALATION_KEYWORDS = ["cancel", "refund", "manager", "lawsuit"];
const EMPATHY_PHRASES = ["i understand", "i'm sorry", "i apologise", "i apologize"];
const DEAD_AIR_THRESHOLD_SECONDS = 15;
const LONG_MONOLOGUE_WORDS = 50;

export function detectMoments(turns: Turn[]): Moment[] {
  const moments: Moment[] = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const lower = turn.text.toLowerCase();
    const wordCount = turn.text.trim().split(/\s+/).length;

    if (turn.speaker === "customer") {
      const matched = ESCALATION_KEYWORDS.find((kw) => lower.includes(kw));
      if (matched) {
        moments.push({
          type: "escalation_signal",
          t: turn.t,
          speaker: turn.speaker,
          matchedText: matched,
        });
      }
    }

    if (turn.speaker === "agent") {
      const matched = EMPATHY_PHRASES.find((phrase) => lower.includes(phrase));
      if (matched) {
        moments.push({
          type: "empathy_statement",
          t: turn.t,
          speaker: turn.speaker,
          matchedText: matched,
        });
      }
    }

    if (i > 0) {
      const gap = turn.t - turns[i - 1].t;
      if (gap > DEAD_AIR_THRESHOLD_SECONDS) {
        moments.push({
          type: "dead_air",
          t: turn.t,
          speaker: "system",
          matchedText: `${gap}s gap`,
        });
      }
    }

    if (wordCount > LONG_MONOLOGUE_WORDS) {
      moments.push({
        type: "long_monologue",
        t: turn.t,
        speaker: turn.speaker,
        matchedText: `${wordCount} words`,
      });
    }
  }

  return moments;
}
