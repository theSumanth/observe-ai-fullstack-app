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

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0]?.message?.content ?? "";

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•"))
    .slice(0, 3);
}
