import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./pages/Landing";
import { UserOnboarding } from "./components/UserOnboarding";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import EventDetails from "./pages/EventDetails";
import Manager from "./pages/Manager";
import ManagerInbox from "./pages/ManagerInbox";
import ManagerAnalytics from "./pages/ManagerAnalytics";
import ManagerEvents from "./pages/ManagerEvents";
import CreateEvent from "./pages/CreateEvent";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ManagerLogin from "./pages/ManagerLogin";
import ManagerRegister from "./pages/ManagerRegister";
import Marketplace from "./pages/Marketplace";
import GroupPurchaseStatus from "./pages/GroupPurchaseStatus";
import Community from "./pages/Community";
import { ManagerRoute } from "./components/ManagerRoute";
import { CommandPalette } from "./components/CommandPalette";
import { LightsUp } from "./components/LightsUp";
import { StageAmbience } from "./components/StageAmbience";

const queryClient = new QueryClient();

/** Fades + lifts each page in on navigation for a smoother, premium feel. */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/manager/login" element={<ManagerLogin />} />
              <Route path="/manager/register" element={<ManagerRegister />} />
              <Route path="/onboarding" element={<ProtectedRoute><UserOnboarding /></ProtectedRoute>} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/event/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/group-purchase/:id" element={<ProtectedRoute><GroupPurchaseStatus /></ProtectedRoute>} />
              <Route path="/manager" element={<ManagerRoute><Manager /></ManagerRoute>} />
              <Route path="/manager/inbox" element={<ManagerRoute><ManagerInbox /></ManagerRoute>} />
              <Route path="/manager/analytics" element={<ManagerRoute><ManagerAnalytics /></ManagerRoute>} />
              <Route path="/manager/events" element={<ManagerRoute><ManagerEvents /></ManagerRoute>} />
              <Route path="/manager/events/new" element={<ManagerRoute><CreateEvent /></ManagerRoute>} />
              <Route path="*" element={<NotFound />} />
      </Routes>
    </motion.div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
      <AuthProvider>
        <AppProvider>
          <StageAmbience />
          <Toaster />
          <Sonner />
          <LightsUp />
          <BrowserRouter>
            <CommandPalette />
            <AnimatedRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
