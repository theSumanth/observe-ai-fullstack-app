import { TrendingUp, TrendingDown, Minus, Heart, AlertTriangle, MessageSquare, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Summary } from "../types";

function ArcBadge({ arc }: { arc: Summary["sentimentArc"] }) {
  const configs = {
    improved: { icon: TrendingUp, label: "Improved", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    declined: { icon: TrendingDown, label: "Declined", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    neutral: { icon: Minus, label: "Neutral", cls: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  };
  const { icon: Icon, label, cls } = configs[arc];
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </Badge>
  );
}

function MetricRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {sub && <span className="text-xs text-muted-foreground ml-1">{sub}</span>}
      </div>
    </div>
  );
}

export function SummaryPanel({ summary, coachingNotes }: {
  summary: Summary;
  coachingNotes: string[];
}) {
  const empathyPct = Math.round(summary.empathyScore * 100);

  return (
    <div className="p-4 space-y-5">
      {/* Talk ratio */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> Talk Ratio
        </p>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
          <div className="bg-primary/80 rounded-l-full transition-all" style={{ width: `${summary.talkRatio.agent}%` }} />
          <div className="bg-orange-400/70 rounded-r-full transition-all" style={{ width: `${summary.talkRatio.customer}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary/80 inline-block" />
            Agent {summary.talkRatio.agent}%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-orange-400/70 inline-block" />
            Customer {summary.talkRatio.customer}%
          </span>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Key metrics */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-primary" /> Metrics
        </p>
        <MetricRow label="Escalation Signals" value={summary.escalationCount} />
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3 text-emerald-400" /> Empathy Score
          </span>
          <div className="flex items-center gap-2">
            <Progress
              value={empathyPct}
              className="w-16 h-1.5 bg-secondary"
            />
            <span className="text-sm font-semibold text-foreground w-8 text-right">{empathyPct}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-muted-foreground">Sentiment Arc</span>
          <ArcBadge arc={summary.sentimentArc} />
        </div>
      </div>

      <Separator className="bg-border" />

      {/* AI coaching notes */}
      {coachingNotes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Coaching
          </p>
          <ul className="space-y-3">
            {coachingNotes.map((note, i) => (
              <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{note.replace(/^•\s*/, "")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
