import { Clock } from "lucide-react";
import { Moment, MomentType } from "../types";
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

export function MomentsSidebar({
  moments,
  activeFilter,
  onFilterChange,
  onJumpTo,
}: {
  moments: Moment[];
  activeFilter: MomentType | null;
  onFilterChange: (type: MomentType | null) => void;
  onJumpTo: (t: number) => void;
}) {
  const filtered = activeFilter
    ? moments.filter((m) => m.type === activeFilter)
    : moments;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Filter by type
        </p>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onFilterChange(null)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              activeFilter === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            All ({moments.length})
          </button>
          {ALL_TYPES.map((type) => {
            const count = moments.filter((m) => m.type === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() =>
                  onFilterChange(activeFilter === type ? null : type)
                }
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  activeFilter === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No moments found
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((m, i) => (
              <li
                key={i}
                className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onJumpTo(m.t)}
              >
                <div className="flex items-center justify-between mb-1">
                  <MomentBadge type={m.type} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(m.t)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
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
