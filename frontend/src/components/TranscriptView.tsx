import { useRef, useEffect } from "react";
import type { AnnotatedTurn } from "../types";
import { MomentBadge } from "./MomentBadge";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function turnBorderColor(turn: AnnotatedTurn) {
  const types = turn.moments.map((m) => m.type);
  if (types.includes("escalation_signal")) return "border-l-red-500";
  if (types.includes("dead_air")) return "border-l-yellow-400";
  if (types.includes("empathy_statement")) return "border-l-green-500";
  if (types.includes("long_monologue")) return "border-l-blue-500";
  return "border-l-transparent";
}

export function TranscriptView({
  turns,
  scrollToTime,
}: {
  turns: AnnotatedTurn[];
  scrollToTime: number | null;
}) {
  const refs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (scrollToTime === null) return;
    const el = refs.current.get(scrollToTime);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollToTime]);

  if (turns.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No transcript turns found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {turns.map((turn, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) refs.current.set(turn.t, el);
          }}
          className={`border-l-4 pl-3 py-2 rounded-r-md transition-colors ${turnBorderColor(turn)} ${
            turn.moments.length > 0 ? "bg-muted/40" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                turn.speaker === "agent" ? "text-blue-600" : "text-orange-600"
              }`}
            >
              {turn.speaker}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(turn.t)}
            </span>
            <div className="flex gap-1 flex-wrap">
              {turn.moments.map((m, j) => (
                <MomentBadge key={j} type={m.type} />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{turn.text}</p>
        </div>
      ))}
    </div>
  );
}
