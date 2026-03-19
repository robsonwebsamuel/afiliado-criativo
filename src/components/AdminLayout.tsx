import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  LayoutGrid,
  CreditCard,
  Plug,
  BarChart2,
  ChevronRight,
  Sparkles,
  Home,
} from "lucide-react";

const adminItems = [
  { title: "Dashboard Admin", url: "/admin", icon: BarChart2 },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Planos", url: "/admin/planos", icon: CreditCard },
  { title: "Templates", url: "/admin/templates", icon: LayoutGrid },
  { title: "Integrações", url: "/admin/integracoes", icon: Plug },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border/50 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3 border-b border-border/50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground text-sm tracking-tight">
            Admin Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {adminItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <button
                key={item.url}
                onClick={() => navigate(item.url)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-elevated hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.title}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Back to app */}
        <div className="p-3 border-t border-border/50">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-elevated hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao App
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
