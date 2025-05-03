import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useLanguage } from "@/hooks/useLanguage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import React from 'react'; // Import React

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Members from "./pages/Members";
import MemberProfile from "./pages/MemberProfile";
import CheckIns from "./pages/CheckIns";
import Payments from "./pages/Payments";
import InvoicesPage from "./pages/InvoicesPage";
import Classes from "./pages/Classes";
import Staff from "./pages/Staff";
import AccessControl from "./pages/AccessControl";
import Settings from "./pages/Settings";
import GroupSubscriptions from "./pages/GroupSubscriptions";
import MessagesCenter from "./pages/MessagesCenter";
import ReportsPage from "./pages/ReportsPage";
import FinanceReportsPage from "./components/reports/FinanceReportsPage";
import MembersReportsPage from "./components/reports/MembersReportsPage";
import GeneralReportsPage from "./components/reports/GeneralReportsPage";
import PaymentSuccessPage from "./components/payments/PaymentSuccessPage";
import PaymentCancelPage from "./components/payments/PaymentCancelPage";
import HypDocumentCreator from "./components/payments/createPayment";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

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
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/members/:memberId" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
          <Route path="/checkins" element={<ProtectedRoute><CheckIns /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
          <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><HypDocumentCreator /></ProtectedRoute>} />
          
          {/* Reports routes */}
          <Route path="/reportscenter" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/reports/finance" element={<ProtectedRoute><FinanceReportsPage /></ProtectedRoute>} />
          <Route path="/reports/members" element={<ProtectedRoute><MembersReportsPage /></ProtectedRoute>} />
          <Route path="/reports/general" element={<ProtectedRoute><GeneralReportsPage /></ProtectedRoute>} />
          
          <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
          <Route path="/access" element={<ProtectedRoute><AccessControl /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesCenter /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/group-subscriptions" element={<ProtectedRoute><GroupSubscriptions /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
