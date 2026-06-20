import client from "./client";
import type { CallListItem, CallDetail, Moment } from "../types";

export const callsApi = {
  list: (agent?: string) =>
    client
      .get<CallListItem[]>("/calls", { params: agent ? { agent } : {} })
      .then((r) => r.data),

  getById: (id: string) =>
    client.get<CallDetail>(`/calls/${id}`).then((r) => r.data),

  getMoments: (id: string) =>
    client.get<{ moments: Moment[] }>(`/calls/${id}/moments`).then((r) => r.data),

  ingest: (payload: unknown) =>
    client.post<{ callId: string; momentCount: number }>("/calls", payload).then((r) => r.data),
};
