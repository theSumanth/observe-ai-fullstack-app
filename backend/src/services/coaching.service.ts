import Anthropic from "@anthropic-ai/sdk";
import { Turn, Moment } from "../types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•"))
    .slice(0, 3);
}
