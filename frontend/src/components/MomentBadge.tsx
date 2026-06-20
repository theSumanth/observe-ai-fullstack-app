import { Badge } from "@/components/ui/badge";
import type { MomentType } from "../types";

const config: Record<MomentType, { label: string; className: string }> = {
  escalation_signal: {
    label: "Escalation",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  empathy_statement: {
    label: "Empathy",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  dead_air: {
    label: "Dead Air",
    className: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  },
  long_monologue: {
    label: "Monologue",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

export function MomentBadge({ type }: { type: MomentType }) {
  const { label, className } = config[type];
  return (
    <Badge variant="outline" className={`text-[10px] font-medium px-1.5 py-0 h-4 ${className}`}>
      {label}
    </Badge>
  );
}
