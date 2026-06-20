import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Summary } from "../types";

function ArcBadge({ arc }: { arc: Summary["sentimentArc"] }) {
  const map = {
    improved: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={`capitalize ${map[arc]}`} variant="outline">
      {arc}
    </Badge>
  );
}

export function SummaryPanel({
  summary,
  coachingNotes,
}: {
  summary: Summary;
  coachingNotes: string[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Call Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Talk Ratio</p>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden">
              <div
                className="bg-blue-500"
                style={{ width: `${summary.talkRatio.agent}%` }}
              />
              <div
                className="bg-orange-400"
                style={{ width: `${summary.talkRatio.customer}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Agent {summary.talkRatio.agent}%</span>
              <span>Customer {summary.talkRatio.customer}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Escalations</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.escalationCount}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Empathy Score</p>
              <p className="text-2xl font-bold text-green-600">
                {(summary.empathyScore * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sentiment Arc</span>
            <ArcBadge arc={summary.sentimentArc} />
          </div>
        </CardContent>
      </Card>

      {coachingNotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              AI Coaching Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {coachingNotes.map((note, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
