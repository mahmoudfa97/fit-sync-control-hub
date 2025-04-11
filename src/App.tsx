
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useLanguage } from "@/hooks/useLanguage";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import CheckIns from "./pages/CheckIns";
import Payments from "./pages/Payments";
import Classes from "./pages/Classes";
import Staff from "./pages/Staff";
import AccessControl from "./pages/AccessControl";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Create a wrapper component to use hooks
const AppContent = () => {
  // Initialize language
  useLanguage();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:memberId" element={<MemberProfile />} />
          <Route path="/checkins" element={<CheckIns />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/access" element={<AccessControl />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </Provider>
);

export default App;
