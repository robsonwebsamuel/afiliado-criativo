import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import CreateArt from "./pages/CreateArt";
import Templates from "./pages/Templates";
import HistoryPage from "./pages/HistoryPage";
import CaptionPage from "./pages/CaptionPage";
import InsertLink from "./pages/InsertLink";
import ShortenLink from "./pages/ShortenLink";
import PlansPage from "./pages/PlansPage";
import HelpPage from "./pages/HelpPage";
import ReportsPage from "./pages/ReportsPage";
import StoresPage from "./pages/StoresPage";
import SitePage from "./pages/SitePage";
import AccountPage from "./pages/AccountPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminTemplates from "./pages/admin/AdminTemplates";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected user routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/criar" element={<CreateArt />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/legenda" element={<CaptionPage />} />
              <Route path="/inserir-link" element={<InsertLink />} />
              <Route path="/encurtar" element={<ShortenLink />} />
              <Route path="/planos" element={<PlansPage />} />
              <Route path="/ajuda" element={<HelpPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/lojas" element={<StoresPage />} />
              <Route path="/site" element={<SitePage />} />
              <Route path="/conta" element={<AccountPage />} />

              {/* Protected admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/usuarios" element={<AdminUsers />} />
              <Route path="/admin/planos" element={<AdminPlans />} />
              <Route path="/admin/templates" element={<AdminTemplates />} />
              <Route path="/admin/integracoes" element={<AdminIntegrations />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
