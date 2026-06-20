import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Eye, BarChart3, MessageSquare, Clock, TrendingUp, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ObserveAILogo } from "../components/ObserveAILogo";

const MOMENTS = [
  {
    icon: TrendingUp,
    label: "Escalation Signal",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    desc: "Detects when customers mention cancel, refund, manager, or lawsuit — before the call spirals.",
  },
  {
    icon: MessageSquare,
    label: "Empathy Statement",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    desc: "Flags agent phrases like 'I understand' and 'I'm sorry' to measure emotional intelligence.",
  },
  {
    icon: Clock,
    label: "Dead Air",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    desc: "Catches silence gaps over 15 seconds — a direct indicator of poor customer experience.",
  },
  {
    icon: BarChart3,
    label: "Long Monologue",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    desc: "Identifies turns over 50 words — coaching signal for agents, escalation risk for customers.",
  },
];

const FEATURES = [
  {
    icon: Eye,
    title: "Full Call Visibility",
    desc: "Review every call without listening to recordings. Annotated transcripts show exactly what happened and when.",
  },
  {
    icon: Zap,
    title: "Instant AI Coaching",
    desc: "Each ingested call generates 3 actionable coaching bullets powered by Llama 3.3 — no manual review needed.",
  },
  {
    icon: Shield,
    title: "Sentiment Intelligence",
    desc: "Track whether customer sentiment improved or declined across the call with an automated arc score.",
  },
  {
    icon: BarChart3,
    title: "Supervisor Dashboard",
    desc: "Filter by agent, sort by risk level, and drill into any call in one click. Built for speed.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <ObserveAILogo size="sm" />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Open App <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <Badge
          variant="outline"
          className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs px-3 py-1"
        >
          <Zap className="h-3 w-3 mr-1.5" />
          Hackathon Project · Observe.AI Fullstack Challenge
        </Badge>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
          Call Quality Review
          <br />
          <span className="text-primary">Without Listening</span>
          <br />
          to a Single Recording
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          An internal tool for contact center supervisors. Ingest transcripts, automatically
          detect escalations, empathy gaps, dead air, and long monologues — then review
          every call in seconds.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-base font-semibold"
          >
            Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="border-border text-muted-foreground hover:text-foreground h-12 px-8 text-base"
          >
            Load Demo Call
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "4", label: "Moment Types" },
            { value: "< 2s", label: "Detection Time" },
            { value: "AI", label: "Coaching Notes" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-border max-w-6xl mx-auto" />

      {/* Moment types */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Four Signals That Matter
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every call is automatically scanned for the moments supervisors care most about —
            in real time, with zero manual effort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOMENTS.map((m) => (
            <div
              key={m.label}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border mb-4 ${m.color}`}>
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-border max-w-6xl mx-auto" />

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Built for Supervisors
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything a QA supervisor needs to review calls faster and coach agents better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 flex gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="bg-primary/10 rounded-lg p-2.5 h-fit shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-border max-w-6xl mx-auto" />

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Ingest Transcript", desc: "POST a JSON transcript with turns, timestamps, and speaker labels via API or the dashboard UI." },
            { step: "02", title: "Moments Detected", desc: "The engine instantly scans every turn for escalation signals, empathy statements, dead air, and monologues." },
            { step: "03", title: "Review & Coach", desc: "Supervisors see an annotated transcript, call summary, sentiment arc, and AI-generated coaching notes." },
          ].map((item) => (
            <div key={item.step} className="relative">
              <div className="text-6xl font-black text-border leading-none mb-4 select-none">
                {item.step}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="bg-card border border-primary/20 rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
          <div className="relative">
            <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Ready to Review Calls?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Load a demo call or paste your own transcript JSON and see the full
              analysis in under two seconds.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-12 text-base font-semibold"
            >
              Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <ObserveAILogo size="sm" />
          <p className="text-xs text-muted-foreground">
            Call Quality Review Tool · Fullstack Engineer Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
