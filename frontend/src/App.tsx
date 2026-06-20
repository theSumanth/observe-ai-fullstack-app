import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import CallListPage from "./pages/CallListPage";
import CallDetailPage from "./pages/CallDetailPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CallListPage />} />
            <Route path="/calls/:id" element={<CallDetailPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors theme="dark" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
