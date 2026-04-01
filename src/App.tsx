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
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/criar" element={<ProtectedRoute><CreateArt /></ProtectedRoute>} />
              <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
              <Route path="/historico" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/legenda" element={<ProtectedRoute><CaptionPage /></ProtectedRoute>} />
              <Route path="/inserir-link" element={<ProtectedRoute><InsertLink /></ProtectedRoute>} />
              <Route path="/encurtar" element={<ProtectedRoute><ShortenLink /></ProtectedRoute>} />
              <Route path="/planos" element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
              <Route path="/ajuda" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
              <Route path="/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/lojas" element={<ProtectedRoute><StoresPage /></ProtectedRoute>} />
              <Route path="/site" element={<ProtectedRoute><SitePage /></ProtectedRoute>} />
              <Route path="/conta" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

              {/* Protected admin routes */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/planos" element={<ProtectedRoute><AdminPlans /></ProtectedRoute>} />
              <Route path="/admin/templates" element={<ProtectedRoute><AdminTemplates /></ProtectedRoute>} />
              <Route path="/admin/integracoes" element={<ProtectedRoute><AdminIntegrations /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
