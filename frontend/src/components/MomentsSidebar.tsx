import { Clock } from "lucide-react";
import type { Moment, MomentType } from "../types";
import { MomentBadge } from "./MomentBadge";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ALL_TYPES: MomentType[] = [
  "escalation_signal",
  "empathy_statement",
  "dead_air",
  "long_monologue",
];

const TYPE_LABELS: Record<MomentType, string> = {
  escalation_signal: "Escalation",
  empathy_statement: "Empathy",
  dead_air: "Dead Air",
  long_monologue: "Monologue",
};

export function MomentsSidebar({ moments, activeFilter, onFilterChange, onJumpTo }: {
  moments: Moment[];
  activeFilter: MomentType | null;
  onFilterChange: (type: MomentType | null) => void;
  onJumpTo: (t: number) => void;
}) {
  const filtered = activeFilter ? moments.filter((m) => m.type === activeFilter) : moments;

  return (
    <div className="flex flex-col h-full">
      {/* Filter chips */}
      <div className="p-3 border-b border-border space-y-2">
        <button
          onClick={() => onFilterChange(null)}
          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            activeFilter === null
              ? "bg-primary/10 border-primary/30 text-primary font-medium"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          All moments ({moments.length})
        </button>
        {ALL_TYPES.map((type) => {
          const count = moments.filter((m) => m.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => onFilterChange(activeFilter === type ? null : type)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors flex items-center justify-between ${
                activeFilter === type
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{TYPE_LABELS[type]}</span>
              <span className="text-[10px] bg-secondary rounded px-1.5">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Moment list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No moments</div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((m, i) => (
              <li
                key={i}
                onClick={() => onJumpTo(m.t)}
                className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <MomentBadge type={m.type} />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(m.t)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-1 font-mono">
                  {m.matchedText}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
