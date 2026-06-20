import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useCall, useCallMoments } from "../hooks/useCalls";
import { TranscriptView } from "../components/TranscriptView";
import { SummaryPanel } from "../components/SummaryPanel";
import { MomentsSidebar } from "../components/MomentsSidebar";
import { MomentType } from "../types";

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
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-[1fr_280px_280px] gap-4">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (callError || !call) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Call not found or failed to load.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{call.agentName}</span>
          <span className="text-muted-foreground text-sm">{call.callId}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Transcript
          </h2>
          <TranscriptView turns={call.turns} scrollToTime={scrollToTime} />
        </div>

        <div className="w-72 border-l overflow-y-auto flex flex-col">
          <div className="p-4 border-b">
            <SummaryPanel summary={call.summary} coachingNotes={call.coachingNotes} />
          </div>
        </div>

        <div className="w-64 border-l flex flex-col">
          <div className="p-3 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Moments ({moments.length})
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
