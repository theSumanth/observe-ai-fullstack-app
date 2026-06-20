import { Badge } from "@/components/ui/badge";
import { MomentType } from "../types";

const config: Record<MomentType, { label: string; className: string }> = {
  escalation_signal: {
    label: "Escalation",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  empathy_statement: {
    label: "Empathy",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  dead_air: {
    label: "Dead Air",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  long_monologue: {
    label: "Monologue",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function MomentBadge({ type }: { type: MomentType }) {
  const { label, className } = config[type];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  );
}
