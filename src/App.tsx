import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewComplaint from "./pages/citizen/NewComplaint";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetail from "./pages/citizen/ComplaintDetail";
import Dashboard from "./pages/admin/Dashboard";
import AllComplaints from "./pages/admin/AllComplaints";
import OfficerComplaints from "./pages/officer/OfficerComplaints";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/citizen/new-complaint" element={<NewComplaint />} />
            <Route path="/citizen/my-complaints" element={<MyComplaints />} />
            <Route path="/citizen/complaint/:id" element={<ComplaintDetail />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/complaints" element={<AllComplaints />} />
            <Route path="/officer" element={<OfficerComplaints />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
