import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { RoleSelection } from "./components/RoleSelection";
import { UserOnboarding } from "./components/UserOnboarding";
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
 import { ManagerRoute } from "./components/ManagerRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelection />} />
             <Route path="/login" element={<Login />} />
             <Route path="/register" element={<Register />} />
             <Route path="/manager/login" element={<ManagerLogin />} />
             <Route path="/manager/register" element={<ManagerRegister />} />
            <Route path="/onboarding" element={<UserOnboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/event/:id" element={<EventDetails />} />
           <Route path="/marketplace" element={<Marketplace />} />
           <Route path="/group-purchase/:id" element={<GroupPurchaseStatus />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/manager/inbox" element={<ManagerInbox />} />
            <Route path="/manager/analytics" element={<ManagerAnalytics />} />
            <Route path="/manager/events" element={<ManagerEvents />} />
            <Route path="/manager/events/new" element={<CreateEvent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
