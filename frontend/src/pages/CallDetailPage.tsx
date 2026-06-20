import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Clock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCall, useCallMoments } from "../hooks/useCalls";
import { TranscriptView } from "../components/TranscriptView";
import { SummaryPanel } from "../components/SummaryPanel";
import { MomentsSidebar } from "../components/MomentsSidebar";
import type { MomentType } from "../types";

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<MomentType | null>(null);
  const [scrollToTime, setScrollToTime] = useState<number | null>(null);

  const { data: call, isLoading: callLoading, error: callError } = useCall(id!);
  const { data: momentsData, isLoading: momentsLoading } = useCallMoments(id!);
  const moments = momentsData?.moments ?? [];

  if (callLoading || momentsLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-4">
        <Skeleton className="h-14 w-full rounded-xl bg-card" />
        <div className="grid grid-cols-[1fr_300px_260px] gap-4 h-[80vh]">
          <Skeleton className="h-full rounded-xl bg-card" />
          <Skeleton className="h-full rounded-xl bg-card" />
          <Skeleton className="h-full rounded-xl bg-card" />
        </div>
      </div>
    );
  }

  if (callError || !call) {
    return (
      <div className="p-6">
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
          <AlertDescription>Call not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const initials = call.agentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="h-14 px-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Separator orientation="vertical" className="h-4" />

          <div className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xs">{initials}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{call.agentName}</span>
              <span className="text-xs text-muted-foreground font-mono">{call.callId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
            <Badge variant="outline" className="border-border text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(call.duration)}
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs flex items-center gap-1">
              <Layers className="h-3 w-3" /> {moments.length} moments
            </Badge>
            <Badge variant="outline" className="border-border text-muted-foreground text-xs flex items-center gap-1">
              <Phone className="h-3 w-3" /> {call.turns.length} turns
            </Badge>
          </div>
        </div>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Transcript */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-primary" />
            Transcript
          </h2>
          <TranscriptView turns={call.turns} scrollToTime={scrollToTime} />
        </div>

        {/* Summary */}
        <div className="w-[300px] border-l border-border overflow-y-auto bg-card/30">
          <SummaryPanel summary={call.summary} coachingNotes={call.coachingNotes} />
        </div>

        {/* Moments sidebar */}
        <div className="w-[260px] border-l border-border flex flex-col bg-card/30">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Moments
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <MomentsSidebar
              moments={moments}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onJumpTo={(t) => setScrollToTime(t)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
