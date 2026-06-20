import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { callsApi } from "../api/calls.api";

export function useCalls(agent?: string) {
  return useQuery({
    queryKey: ["calls", agent],
    queryFn: () => callsApi.list(agent),
  });
}

export function useCall(id: string) {
  return useQuery({
    queryKey: ["calls", id],
    queryFn: () => callsApi.getById(id),
    enabled: !!id,
  });
}

export function useCallMoments(id: string) {
  return useQuery({
    queryKey: ["calls", id, "moments"],
    queryFn: () => callsApi.getMoments(id),
    enabled: !!id,
  });
}

export function useIngestCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: callsApi.ingest,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calls"] }),
  });
}
