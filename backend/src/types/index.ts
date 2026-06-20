import { z } from "zod";

export const SpeakerSchema = z.enum(["agent", "customer"], {
  error: 'speaker must be "agent" or "customer"',
});
export type Speaker = z.infer<typeof SpeakerSchema>;

export const MomentTypeSchema = z.enum([
  "escalation_signal",
  "empathy_statement",
  "dead_air",
  "long_monologue",
]);
export type MomentType = z.infer<typeof MomentTypeSchema>;

export const SentimentArcSchema = z.enum(["improved", "declined", "neutral"]);
export type SentimentArc = z.infer<typeof SentimentArcSchema>;

export const TurnSchema = z.object({
  speaker: SpeakerSchema,
  text: z.string().min(1, "turn text cannot be empty"),
  t: z.number().nonnegative("t (timestamp) must be 0 or greater"),
});
export type Turn = z.infer<typeof TurnSchema>;

export const IngestCallSchema = z.object({
  callId: z.string().min(1, "callId is required"),
  agentName: z.string().min(1, "agentName is required"),
  duration: z.number().positive("duration must be a positive number in seconds"),
  turns: z.array(TurnSchema).min(1, "turns must have at least one entry"),
});
export type IngestCallInput = z.infer<typeof IngestCallSchema>;

export interface Moment {
  type: MomentType;
  t: number;
  speaker: Speaker | "system";
  matchedText: string;
}

export interface Summary {
  talkRatio: { agent: number; customer: number };
  escalationCount: number;
  empathyScore: number;
  sentimentArc: SentimentArc;
}

export interface AnnotatedTurn extends Turn {
  moments: Moment[];
}

export interface Call {
  callId: string;
  agentName: string;
  duration: number;
  turns: Turn[];
  moments: Moment[];
  summary: Summary;
  coachingNotes: string[];
}

export interface CallListItem {
  callId: string;
  agentName: string;
  duration: number;
  momentCount: number;
  empathyScore: number;
  sentimentArc: SentimentArc;
}
