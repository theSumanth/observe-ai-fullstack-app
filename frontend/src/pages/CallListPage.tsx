import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search, Upload, Phone, TrendingUp, TrendingDown,
  Minus, AlertTriangle, Heart, Clock, Zap, ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCalls, useIngestCall } from "../hooks/useCalls";
import { ObserveAILogo } from "../components/ObserveAILogo";
import type { CallListItem } from "../types";

const DEMO_CALL = {
  callId: `DEMO-${Date.now()}`,
  agentName: "Priya Sharma",
  duration: 240,
  turns: [
    { speaker: "agent", text: "Thank you for calling support, how can I help you today?", t: 0 },
    { speaker: "customer", text: "I've been waiting three weeks for my refund and I still haven't received anything. This is completely unacceptable. I need this resolved today or I'm cancelling my subscription.", t: 7 },
    { speaker: "agent", text: "I completely understand your frustration and I'm really sorry about the delay. Let me look into this right away for you.", t: 18 },
    { speaker: "customer", text: "I want to speak to a manager. I'm going to cancel my account if this isn't resolved today. This is the third time I've called about this same issue.", t: 25 },
    { speaker: "agent", text: "Absolutely, let me pull up your account right now and get this sorted for you. I can see the refund request here and I'll escalate this to our billing team immediately to get this processed today.", t: 48 },
    { speaker: "customer", text: "Fine. But I'm telling you, if this isn't fixed today I'm filing a lawsuit and posting about this online.", t: 75 },
    { speaker: "agent", text: "I completely understand your concern and I want to make this right. I've just submitted an urgent escalation ticket and you'll receive a confirmation email within the next 30 minutes with the refund details.", t: 85 },
    { speaker: "customer", text: "Okay. How long will the refund take once it's processed?", t: 110 },
    { speaker: "agent", text: "The refund will appear in your account within 3 to 5 business days once our billing team processes it, which should happen today.", t: 118 },
    { speaker: "customer", text: "Alright, I'll wait for that email. Thank you.", t: 130 },
    { speaker: "agent", text: "You're welcome. I'm sorry again for the inconvenience. Is there anything else I can help you with today?", t: 137 },
  ],
};

function ArcIcon({ arc }: { arc: CallListItem["sentimentArc"] }) {
  if (arc === "improved") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (arc === "declined") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-400" />;
}

function ArcBadge({ arc }: { arc: CallListItem["sentimentArc"] }) {
  const styles = {
    improved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    declined: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <Badge variant="outline" className={`flex items-center gap-1 text-xs ${styles[arc]}`}>
      <ArcIcon arc={arc} />
      {arc}
    </Badge>
  );
}

function RiskLevel({ count }: { count: number }) {
  if (count === 0) return <span className="text-xs text-emerald-400 font-medium">Low risk</span>;
  if (count <= 2) return <span className="text-xs text-amber-400 font-medium">Med risk</span>;
  return <span className="text-xs text-red-400 font-medium">High risk</span>;
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`rounded-lg p-2.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function CallListPage() {
  const navigate = useNavigate();
  const [agentFilter, setAgentFilter] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: calls, isLoading, error } = useCalls(agentFilter || undefined);
  const ingest = useIngestCall();

  const handleDemoLoad = () => {
    const demo = { ...DEMO_CALL, callId: `DEMO-${Date.now()}` };
    ingest.mutate(demo, {
      onSuccess: (res) => toast.success(`Demo call loaded — ${res.momentCount} moments detected`),
      onError: () => toast.error("Failed to load demo call"),
    });
  };

  const handleIngestJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      ingest.mutate(parsed, {
        onSuccess: (res) => {
          toast.success(`Call ingested — ${res.momentCount} moments detected`);
          setDialogOpen(false);
          setJsonInput("");
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : "Ingestion failed");
        },
      });
    } catch {
      toast.error("Invalid JSON");
    }
  };

  const totalMoments = calls?.reduce((s, c) => s + c.momentCount, 0) ?? 0;
  const avgEmpathy = calls?.length
    ? Math.round((calls.reduce((s, c) => s + c.empathyScore, 0) / calls.length) * 100)
    : 0;
  const highRisk = calls?.filter((c) => c.momentCount > 2).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ObserveAILogo size="sm" />
            <Separator orientation="vertical" className="h-4 mx-1" />
            <span className="text-sm text-muted-foreground">Call Quality Review</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoLoad}
              disabled={ingest.isPending}
              className="border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Load Demo
            </Button>
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Ingest Call
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats row */}
        {calls && calls.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Calls" value={calls.length} icon={Phone}
              color="bg-primary/10 text-primary" />
            <StatCard label="Total Moments" value={totalMoments} icon={AlertTriangle}
              color="bg-amber-500/10 text-amber-400" />
            <StatCard label="Avg Empathy" value={`${avgEmpathy}%`} icon={Heart}
              color="bg-emerald-500/10 text-emerald-400" />
            <StatCard label="High Risk Calls" value={highRisk} icon={TrendingDown}
              color="bg-red-500/10 text-red-400" />
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by agent name..."
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="pl-9 bg-card border-border focus:border-primary/50"
            />
          </div>
          {calls && (
            <span className="text-sm text-muted-foreground">
              {calls.length} {calls.length === 1 ? "call" : "calls"}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl bg-card" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
            <AlertDescription>Failed to load calls. Is the backend running?</AlertDescription>
          </Alert>
        )}

        {/* Empty */}
        {calls && calls.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-primary/10 rounded-full p-5 mb-4">
              <Phone className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No calls yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Load a demo call or ingest a transcript JSON to get started.
            </p>
            <Button
              onClick={handleDemoLoad}
              disabled={ingest.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="h-4 w-4 mr-2" />
              Load Demo Call
            </Button>
          </div>
        )}

        {/* Call list */}
        <div className="space-y-3">
          {calls?.map((call) => (
            <div
              key={call.callId}
              onClick={() => navigate(`/calls/${call.callId}`)}
              className="group bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-card/80 transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                {/* Left: agent info */}
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">
                      {call.agentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{call.agentName}</span>
                      <span className="text-xs text-muted-foreground font-mono">{call.callId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDuration(call.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {call.momentCount} moments
                      </span>
                      <RiskLevel count={call.momentCount} />
                    </div>
                  </div>
                </div>

                {/* Right: metrics */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground mb-1">Empathy</p>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={call.empathyScore * 100}
                        className="w-20 h-1.5 bg-secondary"
                      />
                      <span className="text-xs font-medium text-foreground w-8">
                        {Math.round(call.empathyScore * 100)}%
                      </span>
                    </div>
                  </div>
                  <ArcBadge arc={call.sentimentArc} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Ingest dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Ingest Call Transcript</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full h-64 p-3 text-sm font-mono rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder='Paste JSON transcript here...'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button onClick={handleIngestJson} disabled={ingest.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90">
              {ingest.isPending ? "Processing…" : "Ingest"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
