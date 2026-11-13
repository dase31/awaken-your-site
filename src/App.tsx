import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import AuthCallback from "./pages/AuthCallback";
import Match from "./pages/Match";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ChatThread from "./pages/ChatThread";
import Reflections from "./pages/Reflections";
import Connect from "./pages/Connect";
import Telos from "./pages/Telos";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import UsernameSetup from "./pages/UsernameSetup";
import SafetyCheck from "./pages/SafetyCheck";
import EditProfile from "./pages/EditProfile";
import BlockedUsers from "./pages/BlockedUsers";
import { TermsPage, PrivacyPage, SupportPage, CrisisPage } from "./pages/PublicPages";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useGlobalErrorToasts } from "@/lib/globalErrors";
import { usePushRouting } from "@/lib/push";
import NotificationsSetup from "./pages/NotificationsSetup";

const queryClient = new QueryClient();

// Inside the router so it can use router hooks; a screen that crashes shows
// the fallback instead of a blank page, and stray async failures become a
// toast rather than nothing.
const Shell = () => {
  useGlobalErrorToasts();
  usePushRouting();
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/match" element={<Match />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:conversationId" element={<ChatThread />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/telos" element={<Telos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<EditProfile />} />
        <Route path="/settings/blocked" element={<BlockedUsers />} />
        <Route path="/safety-check" element={<SafetyCheck />} />
        <Route path="/notifications-setup" element={<NotificationsSetup />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/crisis" element={<CrisisPage />} />
        <Route path="/username-setup" element={<UsernameSetup />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
