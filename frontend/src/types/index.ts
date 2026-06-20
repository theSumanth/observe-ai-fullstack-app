export type Speaker = "agent" | "customer";
export type MomentType =
  | "escalation_signal"
  | "empathy_statement"
  | "dead_air"
  | "long_monologue";
export type SentimentArc = "improved" | "declined" | "neutral";

export interface Moment {
  type: MomentType;
  t: number;
  speaker: Speaker | "system";
  matchedText: string;
}

export interface Turn {
  speaker: Speaker;
  text: string;
  t: number;
}

export interface AnnotatedTurn extends Turn {
  moments: Moment[];
}

export interface Summary {
  talkRatio: { agent: number; customer: number };
  escalationCount: number;
  empathyScore: number;
  sentimentArc: SentimentArc;
}

export interface CallListItem {
  callId: string;
  agentName: string;
  duration: number;
  momentCount: number;
  empathyScore: number;
  sentimentArc: SentimentArc;
}

export interface CallDetail {
  callId: string;
  agentName: string;
  duration: number;
  turns: AnnotatedTurn[];
  summary: Summary;
  coachingNotes: string[];
}
