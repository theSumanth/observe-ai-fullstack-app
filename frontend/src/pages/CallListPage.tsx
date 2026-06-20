import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Search, Upload, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCalls, useIngestCall } from "../hooks/useCalls";
import type { CallListItem } from "../types";

const DEMO_CALL = {
  callId: `DEMO-${Date.now()}`,
  agentName: "Priya",
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

function RiskBadge({ count }: { count: number }) {
  if (count === 0)
    return <Badge className="bg-green-100 text-green-800" variant="outline">Low Risk</Badge>;
  if (count <= 2)
    return <Badge className="bg-yellow-100 text-yellow-800" variant="outline">Medium Risk</Badge>;
  return <Badge className="bg-red-100 text-red-800" variant="outline">High Risk</Badge>;
}

function ArcBadge({ arc }: { arc: CallListItem["sentimentArc"] }) {
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

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
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
      onSuccess: (res) => {
        toast.success(`Demo call loaded — ${res.momentCount} moments detected`);
      },
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
          const msg = err instanceof Error ? err.message : "Ingestion failed";
          toast.error(msg);
        },
      });
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Call Quality Review</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDemoLoad} disabled={ingest.isPending}>
            Load Demo Call
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> Ingest Call
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by agent name..."
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>Failed to load calls. Is the backend running?</AlertDescription>
          </Alert>
        )}

        {calls && calls.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No calls yet</p>
            <p className="text-sm mt-1">Load a demo call or ingest a transcript to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {calls?.map((call) => (
            <Card
              key={call.callId}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/calls/${call.callId}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{call.agentName}</span>
                      <span className="text-xs text-muted-foreground">{call.callId}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatDuration(call.duration)}</span>
                      <span>{call.momentCount} moments</span>
                      <span>Empathy {(call.empathyScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ArcBadge arc={call.sentimentArc} />
                    <RiskBadge count={call.momentCount} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ingest Call Transcript</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full h-64 p-3 text-sm font-mono border rounded-md bg-muted resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='Paste JSON transcript here...'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleIngestJson} disabled={ingest.isPending}>
              {ingest.isPending ? "Processing..." : "Ingest"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
