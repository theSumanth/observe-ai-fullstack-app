import { useRef, useEffect } from "react";
import type { AnnotatedTurn } from "../types";
import { MomentBadge } from "./MomentBadge";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function turnAccent(turn: AnnotatedTurn) {
  const types = turn.moments.map((m) => m.type);
  if (types.includes("escalation_signal")) return "border-l-red-500 bg-red-500/5";
  if (types.includes("dead_air")) return "border-l-amber-400 bg-amber-400/5";
  if (types.includes("empathy_statement")) return "border-l-emerald-500 bg-emerald-500/5";
  if (types.includes("long_monologue")) return "border-l-blue-500 bg-blue-500/5";
  return "border-l-border bg-transparent";
}

export function TranscriptView({ turns, scrollToTime }: {
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
      <div className="text-center py-16 text-muted-foreground text-sm">
        No transcript turns found.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-3xl">
      {turns.map((turn, i) => (
        <div
          key={i}
          ref={(el) => { if (el) refs.current.set(turn.t, el); }}
          className={`border-l-2 pl-4 pr-3 py-3 rounded-r-lg transition-colors ${turnAccent(turn)}`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
              turn.speaker === "agent"
                ? "bg-primary/10 text-primary"
                : "bg-orange-400/10 text-orange-400"
            }`}>
              {turn.speaker}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatTime(turn.t)}
            </span>
            <div className="flex gap-1 flex-wrap">
              {turn.moments.map((m, j) => (
                <MomentBadge key={j} type={m.type} />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{turn.text}</p>
        </div>
      ))}
    </div>
  );
}
