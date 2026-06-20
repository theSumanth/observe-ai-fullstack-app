import { Call, CallListItem } from "../types";

const store = new Map<string, Call>();

export const callsStore = {
  save(call: Call): void {
    store.set(call.callId, call);
  },

  findById(callId: string): Call | undefined {
    return store.get(callId);
  },

  findAll(agentFilter?: string): CallListItem[] {
    const calls = Array.from(store.values());
    const filtered = agentFilter
      ? calls.filter((c) =>
          c.agentName.toLowerCase().includes(agentFilter.toLowerCase())
        )
      : calls;

    return filtered.map((c) => ({
      callId: c.callId,
      agentName: c.agentName,
      duration: c.duration,
      momentCount: c.moments.length,
      empathyScore: c.summary.empathyScore,
      sentimentArc: c.summary.sentimentArc,
    }));
  },

  exists(callId: string): boolean {
    return store.has(callId);
  },

  clear(): void {
    store.clear();
  },
};
