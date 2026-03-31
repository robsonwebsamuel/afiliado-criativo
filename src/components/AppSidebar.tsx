import {
  Sparkles,
  History,
  LayoutGrid,
  BarChart2,
  Store,
  Globe,
  HelpCircle,
  Home,
  Crown,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { currentUser, planLimits } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Relatórios", url: "/relatorios", icon: BarChart2 },
  { title: "Configurar Lojas", url: "/lojas", icon: Store },
  { title: "Templates", url: "/templates", icon: LayoutGrid },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Criar Nova Arte", url: "/criar", icon: Sparkles },
];

const proItems = [
  { title: "Meu Site", url: "/site", icon: Globe },
];

const accountItems = [
  { title: "Conta e Assinatura", url: "/conta", icon: User },
  { title: "Ajuda", url: "/ajuda", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isAdmin } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const limit = planLimits[currentUser.plan];
  const progress = limit.daily === Infinity
    ? 10
    : Math.min((currentUser.artsCreatedToday / limit.daily) * 100, 100);
  const planLabel = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1);

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="backdrop-blur-md">
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              AfiliadoCriativo
            </span>
          )}
        </div>

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-xs">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-elevated transition-all duration-200"
                      activeClassName="bg-elevated text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pro section */}
        {currentUser.plan === "pro" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-xs">
              Pro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {proItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-elevated transition-all duration-200"
                        activeClassName="bg-elevated text-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account & Help */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-elevated transition-all duration-200"
                      activeClassName="bg-elevated text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin section */}
        {currentUser.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground uppercase tracking-widest text-xs">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="hover:bg-elevated transition-all duration-200"
                      activeClassName="bg-elevated text-primary font-medium"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {!collapsed && <span>Painel Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with user info */}
      <SidebarFooter className="border-t border-border/50 p-4">
        {!collapsed && (
          <div className="space-y-3">
            {/* Theme toggle */}
            <ThemeToggle collapsed={collapsed} />

            {/* Usage bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Artes hoje</span>
                <span className="text-foreground font-medium tabular-nums">
                  {currentUser.artsCreatedToday}/{limit.daily === Infinity ? '∞' : limit.daily}
                </span>
              </div>
              <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-sm font-display font-bold text-foreground">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  {currentUser.plan === 'pro' && <Crown className="w-3 h-3 text-accent" />}
                  <span className="text-xs text-muted-foreground capitalize">{planLabel}</span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
        {collapsed && (
          <div className="space-y-2">
            <ThemeToggle collapsed={collapsed} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
