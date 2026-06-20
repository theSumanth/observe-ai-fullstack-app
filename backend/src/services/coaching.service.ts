import Groq from "groq-sdk";
import type { Turn, Moment } from "../types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateCoachingNotes(
  agentName: string,
  turns: Turn[],
  moments: Moment[]
): Promise<string[]> {
  const transcript = turns
    .map((t) => `[${t.speaker.toUpperCase()} @ ${t.t}s]: ${t.text}`)
    .join("\n");

  const momentSummary = moments
    .map((m) => `- ${m.type} at ${m.t}s (${m.matchedText})`)
    .join("\n");

  const prompt = `You are a contact center quality assurance coach reviewing a call by agent "${agentName}".

TRANSCRIPT:
${transcript}

DETECTED MOMENTS:
${momentSummary || "None detected"}

Write exactly 3 concise coaching bullet points for this agent. Focus on specific, actionable feedback based on what happened in this call. Be constructive and professional. Return only the 3 bullet points, one per line, starting with "•".`;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const bullets = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("•"))
      .slice(0, 3);

    if (bullets.length > 0) return bullets;
  } catch {
    // Groq unavailable — fall through to deterministic fallback
  }

  return buildFallbackNotes(moments);
}

function buildFallbackNotes(moments: Moment[]): string[] {
  const notes: string[] = [];
  const types = moments.map((m) => m.type);

  if (types.includes("escalation_signal")) {
    notes.push("• De-escalation opportunity: customer showed signs of frustration — practise using calm, solution-first language before offering an escalation path.");
  }
  if (types.includes("empathy_statement")) {
    notes.push("• Good empathy usage detected — continue acknowledging customer emotions early in the call to build rapport.");
  }
  if (types.includes("dead_air")) {
    notes.push("• Dead air detected: narrate your actions while on hold (e.g. 'I'm pulling up your account now') to keep customers engaged.");
  }
  if (types.includes("long_monologue")) {
    notes.push("• Long monologue detected: break up lengthy explanations with check-in questions to confirm customer understanding.");
  }

  while (notes.length < 3) {
    const defaults = [
      "• Aim to confirm customer understanding at least once per call before wrapping up.",
      "• Close every call with a clear next-step summary so customers know what to expect.",
      "• Use the customer's name at least twice during the call to personalise the interaction.",
    ];
    notes.push(defaults[notes.length]);
  }

  return notes.slice(0, 3);
}
